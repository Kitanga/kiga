import { Tween } from "@tweenjs/tween.js"
import { BoxGeometry, Color, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial, Object3D, PerspectiveCamera, PlaneGeometry, Scene, SphereGeometry, Vector2, Vector3 } from "three"
import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json'
import { Font, TextGeometry } from "three/examples/jsm/Addons.js"
import { lerp } from "three/src/math/MathUtils.js"
import { NetController } from "../Controllers/NetController"
import { SAIL_NAMES, SAILS_CUSTOMIZATIONS } from "../commons/customizations/sails"
import { cloneMesh } from "../commons/utils/cloneMesh"
import { MESH_NAMES, SHIP_SCALES, mesh_repo } from "../ship_repo"
import { FiringSide, IHitPoint } from "./Player"
import { ATTRIBUTE_DEFAULTS, FiringPositions, SAIL_MAT_NAME } from "../constants"
import { BatchedRenderer, Bezier, ColorOverLife, ConeEmitter, ConstantValue, EmitterMode, ForceOverLife, Gradient, IntervalValue, LimitSpeedOverLife, ParticleSystem, ParticleSystemParameters, PiecewiseBezier, RenderMode, SizeOverLife } from "three.quarks"
import { FoamController } from "../Controllers/FoamController"
import { AudioController } from "../Controllers/AudioController"
import { selected_sail } from "../../App"
import { sailsChangeMat, sailsChangeMatReset } from "../commons/utils/sailsChangeMat"
import { CannonVolleyController } from "../Controllers/CannonVolleyController"
import { SplashController } from "../Controllers/SplashController"
import { ImpactController } from "../Controllers/ImpactController"
import { createPlayerMesh } from "../commons/utils/createPlayerMesh"
import { ShipInstanceController } from "../Controllers/ShipInstanceController"
import { killAnim } from "../commons/utils/killAnim"

export interface IEntity {
    /** ID for entity */
    id: string
    /** X Position */
    x: number
    /** Y Position */
    y: number
    /** Rotation */
    rotation: number
    /** Type of entity */
    type: EntityType
    /** A tween to the next position */
    // tween?: Tweens.Tween
    /** Entity Health */
    health: number;

    /** A target for the entity to move to */
    target: { x: number, y: number, dx: number, dy: number, ping?: number }

}

export enum EntityType {
    PLAYER = 'p',
    CRATE = 'rk'
}

export class Entity implements IEntity {
    get x() {
        return this.mesh.position.x;
    };
    get y() {
        return this.mesh.position.z;
    };
    rotation = 0;
    maxHealth = ATTRIBUTE_DEFAULTS.HEALTH;
    health = 0;

    id = '';
    user = 'GUEST';
    score = 0;

    type = EntityType.CRATE;

    mesh: Object3D;
    meshInner: Object3D;
    meshSubstitute: Object3D;

    target: IEntity['target'];

    lastUpdateTarget = 0;
    elapsedTimeSinceTargetUpdate = 0;

    entities: {
        x: number,
        y: number,
        dx: number,
        dy: number,
    }[] = [];

    headerSection!: Group;
    healthBar!: Mesh;
    nameText!: Mesh;

    /** Used when applying transforms during lerping, this way we aren't making a vector X number of times per second */
    private forward = new Vector2();
    tweens: Tween<any>[] = [];

    sailsMaterials: MeshStandardMaterial[] = [];
    sailsMesh: Mesh;
    batchSystem: BatchedRenderer;
    emitterSystems: Map<FiringSide, ParticleSystem[]> = new Map([
        [FiringSide.FORWARD, []],
        [FiringSide.PORT, []],
        [FiringSide.STARBOARD, []],
        [FiringSide.BACKWARD, []],
    ]);

    nextFoamSpawn = 0;

    instanceController = ShipInstanceController.getInstance();
    instanceIX: number;

    constructor(public scene: Scene, type: EntityType, id: string, public camera: PerspectiveCamera, public net?: NetController) {
        this.type = type;

        this.id = id || '';
        // this.net = NetController.getInstance();

        switch (type) {
            case EntityType.PLAYER:
                {
                    if (net) {
                        this.batchSystem = net.player.batchSystem;
                    }
                    const playerMeshes = createPlayerMesh();

                    const mesh = this.mesh = playerMeshes.gameObj;
                    const sailsMesh: Mesh = cloneMesh(mesh_repo[MESH_NAMES.BASIC_1_SAILS_DEFAULT].scene.clone() as any) as any;
                    let meshInner = this.meshInner = playerMeshes.gameObj.children[0];
                    let meshSubstitute = this.meshSubstitute = playerMeshes.substitute;

                    sailsMesh.name = 'SAILS';

                    sailsMesh.rotation.y = Math.PI;
                    sailsMesh.position.x = -0.9;
                    sailsMesh.position.y = -1.7;
                    // sailsMesh.position.z = 1.4;
                    meshSubstitute.add(sailsMesh);

                    scene.add(meshSubstitute);

                    sailsMesh.traverseVisible(child => {
                        if (child instanceof Mesh && child?.material?.name == SAIL_MAT_NAME) {
                            this.sailsMaterials.push(child.material);
                            this.sailsMesh = child;
                        }
                    });

                    // let meshInner = this.meshInner = mesh.children[0] as Mesh;

                    // mesh.position.y = 1000;
                    console.log('main ship mesh:', mesh);

                    console.log('meshinner:', meshInner)
                    // console.log('meshInner:', this.meshInner)

                    // mesh.scale.multiplyScalar(SHIP_SCALES.BASIC_1);

                    this.createHealthBar();

                    this.target = {
                        x: 0,
                        y: 0,
                        dx: 0,
                        dy: 0,
                    };

                    ; ([
                        [
                            Math.PI * 0.5,
                            FiringSide.FORWARD,
                            FiringPositions[FiringSide.FORWARD],
                        ],
                        [
                            Math.PI,
                            FiringSide.PORT,
                            FiringPositions[FiringSide.PORT],
                        ],
                        [
                            0,
                            FiringSide.STARBOARD,
                            FiringPositions[FiringSide.STARBOARD],
                        ],
                        [
                            -Math.PI * 0.5,
                            FiringSide.BACKWARD,
                            FiringPositions[FiringSide.BACKWARD],
                        ],
                    ] as const).forEach(([dir, SIDE, gunPlacements]) => {
                        gunPlacements.forEach(gun => {
                            const position = new Vector3().fromArray(gun);
                            this.createEmitter(dir, position, this.emitterSystems.get(SIDE));
                        });
                    });

                    scene.add(mesh);

                    [
                        mesh,
                        meshSubstitute,
                    ].forEach(obj => {
                        obj.traverse(child => {
                            if (typeof child.frustumCulled !== 'undefined' && child.frustumCulled) {
                                child.frustumCulled = false;
                            }
                        })
                    })
                }
                break;
        }

        // @ts-ignore
        this.mesh.parentEntity = this.meshInner.parentEntity = this;
    }

    createEmitter(direction: number, position: Vector3, emitterSystems: any[] = []) {
        const geo = new SphereGeometry(0.1, 8, 8);
        const mat = new MeshBasicMaterial({
            color: new Color(0x000),
        });

        const particlesConfig = {
            duration: 0.01,
            looping: false,
            instancingGeometry: geo,
            worldSpace: true,

            shape: new ConeEmitter({
                radius: 0.01,
                arc: 6.2831,
                // thickness: 0.10,
                // thickness: 10,
                // speed: new ConstantValue(20),
                spread: 34,
                angle: 0.122173,
                // angle: Math.PI*0.25,
                mode: EmitterMode.Burst,
            }),

            // startLife: new IntervalValue(0.0, 0.5),
            // endLife: new IntervalValue(0.43, 0.5),
            startSpeed: new IntervalValue(0.1, 5),
            endSpeed: new IntervalValue(7, 10),
            startSize: new IntervalValue(1.2, 1.2),
            endSize: new IntervalValue(1.2, 1.2),
            // startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            emissionOverTime: new ConstantValue(1510),

            material: mat,
            renderMode: RenderMode.Mesh,
            renderOrder: 25,
            startTileIndex: new ConstantValue(0),
            uTileCount: 2,
            vTileCount: 2,

            behaviors: [
                new ForceOverLife(new ConstantValue(0), new ConstantValue(0.052), new ConstantValue(0)),
                new ColorOverLife(new Gradient([
                    [new Vector3(1, 1, 1), 0],
                    [new Vector3(0.25, 0.25, 0.25), 1],
                ],
                    [
                        [1, 0],
                        [0, 1]
                    ]
                )),
                new LimitSpeedOverLife(new PiecewiseBezier([[new Bezier(0, 0, 0, 0), 0]]), 0.25),
                new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 1, 0, 0), 0]])),
            ],
        } as ParticleSystemParameters;

        // Create particle system based on your configuration
        const muzzle = new ParticleSystem(particlesConfig);

        muzzle.emitter.name = `enitity-muzzle-type:${Math.random()}`;
        muzzle.emitter.position.copy(position);
        muzzle.emitter.rotation.y = direction;

        emitterSystems.push(muzzle);
        this.batchSystem.addSystem(muzzle);
        this.meshInner.add(muzzle.emitter);

        muzzle.endEmit();
    }

    fire(firingSide: FiringSide, mss: IHitPoint[]) {
        this.emitterSystems.get(firingSide)?.forEach((gun, ix) => {
            const duration = Math.random() * 250;

            this.meshInner.add(gun.emitter);
            gun.emitter.updateMatrix();
            gun.emitter.updateMatrix();

            const batteryPos = gun.emitter.getWorldPosition(new Vector3());
            const hitPoint = mss[ix];

            gun.restart();
            AudioController.getInstance().playGunFire(this.mesh);
            CannonVolleyController.triggerCannonAnim(batteryPos, hitPoint, duration);

            setTimeout(() => {
                SplashController.triggerSplash(hitPoint.x, hitPoint.z);
                hitPoint.hit && ImpactController.triggerImpact(hitPoint.x, hitPoint.y, hitPoint.z, false);
            }, duration);
        });
    }

    // #region createHealthBar
    createHealthBar() {
        const headerSectionID = `healthSection-${this.id}`;
        const headerBarID = `healthBar-${this.id}`;
        const nameTextID = `nameText-${this.id}`;

        const addedHeaderSection = this.scene.children.find(child => child.name == headerSectionID);

        if (addedHeaderSection) {
            this.headerSection = addedHeaderSection as Group;

            addedHeaderSection.traverse(child => {
                if (child.name == headerBarID) {
                    this.healthBar = child as any;
                }
                if (child.name == nameTextID) {
                    this.nameText = child as any;
                }
            })
        } else {
            console.warn('Healthbar created:', this.id, this.net?.id);
            const width = 1.4;
            const height = 0.1;

            const headerSection = this.headerSection = new Group();

            const barBase = new Mesh(new PlaneGeometry(width, height), new MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.34,
                side: DoubleSide,
            }));
            const bar = this.healthBar = new Mesh(new PlaneGeometry(width, height), new MeshBasicMaterial({
                color: 0x5cb551,
                side: DoubleSide
            }));
            bar.name = headerBarID;

            bar.position.z = 0.01;

            const textGeom = this.createTextGeom(this.user);
            textGeom.computeBoundingBox();

            const textMaterials = [
                // new MeshPhongMaterial({ color: 0xff2727, flatShading: true }), // front
                new MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
                new MeshPhongMaterial({ color: 0x0 }) // side
            ];

            const textMesh = this.nameText = new Mesh(textGeom, textMaterials);

            this.nameText.name = nameTextID;
            textMesh.position.y = 0.2;

            this.updateName(this.user);

            // barBase.scale.setScalar(1.2);

            // barBase.add(bar)
            headerSection.add(barBase);
            headerSection.add(bar);
            headerSection.add(textMesh);

            headerSection.position.copy(this.mesh.position)
            headerSection.position.y = 1;

            headerSection.name = headerSectionID;

            this.scene.add(headerSection);
        }
    }

    updateName(newName: string) {
        this.nameText.geometry = this.createTextGeom(newName);
        this.nameText.geometry.computeBoundingBox();

        const textGeomSize = this.nameText.geometry.boundingBox!.getSize(new Vector3())!;

        // textMesh.position.set(-0.13, -0.05, -0.08);
        this.nameText.position.set(-textGeomSize.x * 0.5, -textGeomSize.y * 0.5 + 0.2, -0.095);
    }

    setTransform = ({ x, y, dx, dy }: { [key: string]: number }, spawning = false) => {
        const {
            mesh,
            meshSubstitute,
        } = this;

        if (mesh) {
            mesh.position.x = x ?? mesh.position.x;
            mesh.position.y = 0;
            mesh.position.z = y ?? mesh.position.z;

            mesh.rotation.y = -Math.atan2(dx || 0, dy || 0);

            meshSubstitute.position.y = -40000;

            if (spawning) {
                meshSubstitute.position.y = 0.2418668;
            }
        }
    }

    setTarget(target: IEntity['target']) {
        this.target = target;
        this.elapsedTimeSinceTargetUpdate = 0;
    }

    kill() {
        console.log('kill');
        killAnim(this);

        this.headerSection.visible = this.mesh.visible = false;
        console.log('this got killed:', this, this.headerSection, this.headerSection.visible);
    }

    update(dt: number) {
        if (this.health <= 0) {
            return;
        }

        const {
            mesh,
            meshInner,
            meshSubstitute,
            target,
            forward,
            net,
            health,
            maxHealth,
            headerSection,
            healthBar,
            camera,
        } = this;

        const { position, rotation } = mesh;
        const { x, z } = position;

        const et = (this.elapsedTimeSinceTargetUpdate += (dt || 0));

        const t = Math.min(1, et / (net!.ping * 2));
        // const t = dt / 1000;

        position.x = lerp(x, target.x, t);
        position.z = lerp(z, target.y, t);
        forward.x = lerp(forward.x, target?.dx, t) || 0;
        forward.y = lerp(forward.y, target?.dy, t) || 0;

        rotation.y = -Math.atan2(forward.y, forward.x);

        const healthPercent = health / maxHealth;

        // mesh.position.y = offset;

        healthBar.scale.set(healthPercent, 1, 1);

        headerSection.position.copy(mesh.position);
        headerSection.position.y = 1;

        headerSection.lookAt(camera.position);

        // meshInner.position.set(0.804959774017334, 1, 0);

        meshSubstitute.position.copy(position);
        meshSubstitute.position.y = 0.2418668;
        meshSubstitute.rotation.copy(rotation);
        meshSubstitute.rotation.y += Math.PI;
        // meshSubstitute.rotation.y = Math.atan2(forward.z, forward.x);

        this.instanceController.updateMesh(this.instanceIX, meshSubstitute);

        const now = Date.now();
        if (this.nextFoamSpawn < now) {
            this.nextFoamSpawn = now + 70;
            mesh.parent && FoamController.triggerFoam(position.x, position.z);
        }
    }

    destroy() {
        [
            this.headerSection,
            this.mesh,
        ].forEach(obj => {
            obj.removeFromParent();
            obj.clear();
        });
    }

    //#region Set sail skin
    setSailsSkin(skinName: string) {
        if (!sailsChangeMat(skinName as SAIL_NAMES, this.sailsMesh)) {
            sailsChangeMatReset(this.sailsMesh);
        }
    }

    private createTextGeom(text: string, size = 0.17) {
        return new TextGeometry(text, {
            font: new Font(helvetiker),
            size,
            depth: 0.0,
        });
    }
}
