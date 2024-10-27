import { Collider, RigidBody } from '@dimforge/rapier2d-compat';
import { Tween } from '@tweenjs/tween.js';
import JoystickController from "joystick-controller";
import { createEffect } from "solid-js";
import { AudioListener, BoxGeometry, Clock, Group, Mesh, MeshStandardMaterial, Object3D, PerspectiveCamera, Raycaster, Scene, SphereGeometry, Vector2, Vector3, Vector3Like } from "three";
import { BatchedRenderer } from "three.quarks";
import { OrbitControls, Projector } from "three/examples/jsm/Addons.js";
import { game_over, set_user_score, user_score } from "../../App";
import { LocalStorageKeys } from '../commons/enums/LocalStorageKeys';
import { PokiController } from '../commons/vendors/PokiController';
import { ATTRIBUTE_DEFAULTS, CAMERA_POS } from "../constants";
import { AnalyticsController } from '../Controllers/AnalyticsController';
import { AudioController } from '../Controllers/AudioController';
import { LocalStorageController } from '../Controllers/LocalStorageController';
import { NetController } from "../Controllers/NetController";
import { PhysicsController } from '../Controllers/PhysicsController';
import { ShipInstanceController } from '../Controllers/ShipInstanceController';
import { SHIP_SCALES } from "../ship_repo";
import { Battery } from "./Battery";
import { lerp } from 'three/src/math/MathUtils.js';

const MATH_PI = Math.PI;

// const PLAYER_TURN_SPEED = 0.7;
const PLAYER_TURN_SPEED = 1.2;
// const PLAYER_TURN_SPEED = 1.4;
// const PLAYER_MOVEMENT_SPEED = 52.0;
// const PLAYER_MOVEMENT_SPEED = 1.4;
const PLAYER_MOVEMENT_SPEED = 1.7;

// const ROTATE_FOR = 0.1;
const ROTATE_FOR = 0.14;
// const ROTATE_HOR = 0.4;
const ROTATE_HOR = 0.052;

export const HIGHEST_SHIP_STAND = 0;
export const LOWEST_SHIP_SINK = -0.18;

const PLAYER_AXIS_VEC3 = new Vector3(0, 1, 0);

const RIGHT_DIR = new Vector2(0, 1);
const LEFT_DIR = new Vector2(0, -1);
const FORWARD_DIR = new Vector2(1, 0);
const BACK_DIR = new Vector2(-1, 0);

let nextPhysicsUpdate = 0;
let physicsDT = 1000 / 30;

export interface IHitPoint extends Vector3Like {
    hit?: boolean
}

export class Player {
    private clock = new Clock();

    mesh: Object3D
    meshInner: Object3D

    forward = new Vector3(-1, 0, 1);
    desiredForward = new Vector2();
    rot = 0;
    desiredAngle = 0;

    health = 0;
    maxHealth = ATTRIBUTE_DEFAULTS.HEALTH;

    // Player stats
    speed = new Vector2();
    maxSpeed = ATTRIBUTE_DEFAULTS.SPEED;
    turnSpeed = ATTRIBUTE_DEFAULTS.TURN_SPEED;

    sailsMaterials: MeshStandardMaterial[] = [];

    range = ATTRIBUTE_DEFAULTS.RANGE;
    tweens: Tween<any>[];
    audioListener: AudioListener;
    sailsMesh: Mesh;
    nextFoamSpawn = 0;
    crateBin: Map<string, import("d:/Documents/__practical_projects/sunbacked/sunbacked-client/src/game/Templates/Crate").Crate> | undefined;
    showCTAIndicator: boolean;
    collectedCrates = 0;
    bossID: string | undefined;
    fps: number = -1;
    dirOnboarded = !!LocalStorageController.getItem(LocalStorageKeys.ONBOARDED);
    firingOnboarded = !!LocalStorageController.getItem(LocalStorageKeys.ONBOARDED);
    shotsFired = 0;
    movementsMade = 0;
    mobileJoystick: JoystickController | undefined;
    HAS_TOUCH = (window as any).HAS_TOUCH;

    get actualRange() {
        return this.range * SHIP_SCALES.BASIC_1;
    };

    frontGuns: Battery;
    // Left guns
    portGuns: Battery;
    // Right guns
    starboardGuns: Battery;
    rearGuns: Battery;

    // Water trails
    waterTrails: Mesh[] = [];

    pixelated = false;
    // pixelated = true;

    input = {
        up: false,
        down: false,
        left: false,
        right: false,

        // fireForward: false,
        // firePort: false,
        // fireStarboard: false,
        // fireBackward: false,
    }
    controlScheme = {
        LEFT: {
            primary: KeyboardKeys.ArrowLeft,
            secondary: KeyboardKeys.A,
        },
        RIGHT: {
            primary: KeyboardKeys.ArrowRight,
            secondary: KeyboardKeys.D,
        },
        UP: {
            primary: KeyboardKeys.ArrowUp,
            secondary: KeyboardKeys.W,
        },
        DOWN: {
            primary: KeyboardKeys.ArrowDown,
            secondary: KeyboardKeys.S,
        },
    }

    net: NetController;
    lastInput = performance.now();

    firingRange: Mesh;

    headerSection!: Group;
    healthBar!: Mesh;

    set score(newScore: number) {
        set_user_score(newScore);
    }

    get score() {
        return user_score();
    }

    xp = 0;

    alive = false;

    audioController!: AudioController;

    colliding: number[] = [];
    collidingSent = new Set<number>();

    currentBin: number;
    currentNeighbouringBins: string[] = [];
    prevNeighbouringBins: string[] = [];

    instanceController = ShipInstanceController.getInstance();
    instanceIX = 0;
    meshSubstitute: Object3D;

    bounds: Vector2[] = [];

    radius = 0.75;

    isHit = false;

    //#region constructor
    constructor(public scene: Scene, public controls: OrbitControls, public camera: PerspectiveCamera, public batchSystem: BatchedRenderer) {
        this.lastInput = performance.now();
        this.collectedCrates = +(LocalStorageController.getItem(LocalStorageKeys.CRATES_COLLECTED) ?? 0)
        this.showCTAIndicator = this.collectedCrates < 3;

        this.audioListener = new AudioListener();

        const mesh = this.mesh = new Object3D();

        // const meshInner = this.meshInner = new Mesh(new BoxGeometry(1, 0.34, 1), new MeshStandardMaterial({
        //     color: 0x0000ff,
        // }));
        const meshInner = this.meshInner = new Object3D();

        const saucerBod = new Mesh(new SphereGeometry(this.radius), new MeshStandardMaterial({
            color: 0x0000ff,
        }));

        saucerBod.scale.y = 0.34;

        const marker = new Mesh(new BoxGeometry(0.25, 0.25, 0.25));
        marker.position.x = 0.7;

        meshInner.add(saucerBod);
        meshInner.add(marker);

        mesh.add(meshInner);

        PhysicsController.getInstance().attachDynamicRigidBody(mesh, 4.117 * 2, 1.439 * 2);

        if (!LocalStorageController.getItem(LocalStorageKeys.ONBOARDED)) {
            // TODO: onboarding hints for saucer dodger
        } else {
            AnalyticsController.getInstance().logAlreadyOnboarded();
        }

        createEffect(() => {
            if (game_over()) {
                this.lastInput = performance.now();
            }
        });

        camera.position.copy(new Vector3()).add(CAMERA_POS);
        controls.target = mesh?.position;

        controls.update();

        scene.add(mesh);
        scene.add(this.audioListener);

        this.setupEventListeners();
    }

    createBounds() {
        const offset = 34;
        const WIDTH = window.innerWidth * devicePixelRatio;
        const HEIGHT = window.innerHeight * devicePixelRatio;
        const HALF_WIDTH = WIDTH * 0.5;
        const HALF_HEIGHT = HEIGHT * 0.5;

        const constEdge = 0.68;

        const edges: [number, number][] = [
            // [
            //     offset,
            //     offset,
            // ],
            // [
            //     WIDTH - offset,
            //     offset,
            // ],
            // [
            //     offset,
            //     offset,
            // ],
            // [
            //     WIDTH - offset,
            //     offset,
            // ],
            // Bottom Left
            [
                -constEdge,
                -constEdge,
            ],
            // Bottom Right
            [
                constEdge,
                -constEdge,
            ],
            // Top Left
            [
                -constEdge,
                constEdge,
            ],
            // Top Right
            [
                constEdge,
                constEdge,
            ],
        ];

        this.bounds = edges.map(([x, y], ix) => {
            const raycaster = new Raycaster();

            raycaster.setFromCamera(new Vector2(x, y), this.camera);

            const hits = raycaster.intersectObject(this.floor)!;

            const hit = hits[0];

            return new Vector2(hit?.point?.x, hit?.point?.z);
        });
    }

    setupVirtualController() {
        this?.mobileJoystick?.destroy?.();

        this.mobileJoystick = new JoystickController({
            // distortion: true,
            dynamicPosition: true,
        }, (data) => {
            this.lastInput = performance.now();

            const {
                angle,
                distance
            } = data;


            if (distance > 0) {
                this.desiredAngle = angle;
            } else {
                this.desiredAngle = this.rot;
            }
            // console.log('data:', data);
        });
    }

    touches: Map<number, { x: number, y: number }> = new Map();

    floor!: Mesh;
    raycaster = new Raycaster();

    nextUpdate = performance.now();

    //#region Update
    update(dt: number, now: number) {
        const dtRatio = dt / 1000;

        if (now >= this.nextUpdate) {
            this.nextUpdate = now + 16.66667;

            const {
                touches,
                mesh,
            } = this;
    
            const {
                position,
            } = mesh;
    
            const rBod: RigidBody = this.mesh.userData['rigidBody'];
    
            const dirVec = new Vector2();
    
            touches.forEach(touch => {
                const x = position.x - touch.x;
                const y = position.z - touch.y;
    
                const vec = new Vector2(x, y).normalize();
    
                dirVec.add(vec);
                // rBod.addForce(dirVec, true);
            });
    
            // rBod.setLinvel(dirVec.normalize().multiplyScalar(34), true);
            rBod.applyImpulse(dirVec.normalize().multiplyScalar(86), true);
    
            const pos = rBod.translation();
    
            position.setX(pos.x).setZ(pos.y);
    
            if (this.bounds.length) {
                const topLeft = this.bounds[2];
                // const topRight = this.bounds[3];
                // const bottomLeft = this.bounds[0];
                const bottomRight = this.bounds[1];
    
                position.clamp(new Vector3(topLeft.x, 0, topLeft.y), new Vector3(bottomRight.x, 0, bottomRight.y));
    
                rBod.setTranslation({
                    x: position.x,
                    y: position.z,
                }, true);
            }
    
            const v = rBod.linvel();
    
            const r = -Math.atan2(v.y, v.x);
    
            const meshInner = this.meshInner;
    
            meshInner.rotation.set(
                0,
                lerp(meshInner.rotation.y, r, dtRatio * 3.4),
                touches.size ? lerp(meshInner.rotation.z, -Math.PI * 0.25, dtRatio * 0.7) : lerp(meshInner.rotation.z, 0, dtRatio * 1.4),
                'YXZ'
            );
    
            // window.v = v;
        }
    }
    //#endregion

    //#region kill
    kill() {
        console.log('Player died');

        this.alive = this.mesh.visible = false;
        this.resetInputs();

        this.healthBar.scale.set(0, 1, 1);
        this.headerSection.visible = false;

        this?.mobileJoystick?.destroy?.();
        this.mobileJoystick = undefined;

        AnalyticsController.getInstance().logGameplayEnd();
        // CrazyGamesController.getInstance().stopGameplaySession();
        PokiController.getInstance().stopGameplaySession();
    }

    //#region resetInputs
    resetInputs = () => {
        console.log('reset inputs:');

        this.input.left = false;
        this.input.right = false;
        this.input.up = false;
        this.input.down = false;
    }

    //#region resetMeshInnerRotation
    resetMeshInnerRotation = () => {
        // this.meshInner.rotation.x = 0;
        // this.meshInner.rotation.z = 0;
    }

    destroy() {
        window.onkeydown = window.onkeyup = window.onauxclick = window.onscroll = null;
    }

    //#region setupEventListeners
    private setupEventListeners() {
        const raycaster = this.raycaster;

        const touchHandler = (ev: TouchEvent) => {
            // document.documentElement.requestFullscreen();
            ev.preventDefault();
            // console.log('touches:', ev.touches);

            // !this.bounds.length && ;

            Array.from(ev.touches).forEach(touch => {
                const pos = new Vector2((touch.clientX / window.innerWidth) * 2 - 1, -(touch.clientY / window.innerHeight) * 2 + 1);

                raycaster.setFromCamera(pos, this.camera);
                const hitInfo = raycaster.intersectObject(this.floor);

                if (hitInfo.length) {
                    const hit = hitInfo[0].point;
                    const point = {
                        x: hit.x,
                        y: hit.z,
                    };

                    // console.log('touch hit:', point);

                    this.touches.set(touch.identifier, point);
                }
            });
        };

        window.addEventListener('touchstart', touchHandler);
        window.addEventListener('touchmove', touchHandler);
        window.addEventListener('touchend', ev => {
            ev.preventDefault();
            // console.log('touches:', ev.changedTouches);

            Array.from(ev.changedTouches).forEach(touch => {
                this.touches.delete(touch.identifier);
            });
        });

        window.onscroll = (ev) => {
            this.lastInput = performance.now();
            ev.preventDefault();
        }
    }
}

enum KeyboardKeys {
    W = 'w',
    A = 'a',
    S = 's',
    D = 'd',
    Q = 'q',
    E = 'e',
    SPACEBAR = ' ',
    ArrowLeft = 'ArrowLeft',
    ArrowRight = 'ArrowRight',
    ArrowUp = 'ArrowUp',
    ArrowDown = 'ArrowDown',
}

export enum FiringSide {
    FORWARD,
    PORT,
    STARBOARD,
    BACKWARD,
}