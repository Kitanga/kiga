import { AdditiveBlending, CircleGeometry, ClampToEdgeWrapping, Color, DoubleSide, MeshBasicMaterial, MirroredRepeatWrapping, Object3D, PlaneGeometry, Scene, SpriteMaterial, TextureLoader, Vector4 } from "three";
import { BatchedRenderer, Bezier, ColorOverLife, ConeEmitter, ConstantColor, ConstantValue, EmitterMode, ForceOverLife, FrameOverLife, IntervalValue, LimitSpeedOverLife, ParticleSystem, ParticleSystemParameters, PiecewiseBezier, RenderMode, SizeOverLife, SpeedOverLife } from "three.quarks";
import { ColorRange } from "three.quarks";
import { TEXTURE_NAMES, texture_repo } from "../texture_repo";
import { focused } from "../../App";

export class FoamController {
    public static instance: FoamController;

    public static getInstance(scene?: Scene, batchSystem?: BatchedRenderer): FoamController {
        if (this.instance) {
            return this.instance;
        } else {
            if (!scene || !batchSystem) {
                throw new Error();
            } else {
                this.instance = new FoamController(scene, batchSystem);
            }

            return this.instance;
        }
    }

    public static triggerFoam(x: number, y: number) {
        this.instance.triggerFoam(x, y);
    }

    public static destroy() {
        // @ts-ignore
        FoamController.instance = null;
    }

    paddleParticlesConfig: ParticleSystemParameters;

    private constructor(public scene: Scene, public batchSystem: BatchedRenderer) {
        //#region Paddle config
        const paddleConfigParts = {
            geom: new CircleGeometry(0.5, 8),
            mat: new MeshBasicMaterial({
                map: texture_repo[TEXTURE_NAMES.FOAM],
                color: 0xffffff,
                // transparent: true,
                side: DoubleSide,
                blending: AdditiveBlending,
            }),
        };

        this.paddleParticlesConfig = {
            autoDestroy: true,
            duration: 0.07,
            prewarm: true,
            looping: true,
            // looping: true,
            worldSpace: true,

            instancingGeometry: paddleConfigParts.geom,
            shape: new ConeEmitter({
                radius: 0.01,
                arc: 0,
                thickness: 0,
                angle: 0.0,
                mode: EmitterMode.Burst,
            }),
            // emissionBursts: [
            //     {
            //         count: new ConstantValue(1),
            //         cycle: 1,
            //         interval: 0,
            //         probability: 0.1,
            //         time: 0.1,
            //     }
            // ],
            startRotation: new IntervalValue(0, 2 * Math.PI),

            // startLife: new IntervalValue(0.25, 0.34),
            // startSpeed: new IntervalValue(0.1 + this.maxSpeed, 0.1 + this.maxSpeed),
            // endSpeed: new IntervalValue(2 + this.maxSpeed, 2 + this.maxSpeed),
            startSize: new ConstantValue(0.52),
            // endSize: new ConstantValue(0.0),
            // startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            emissionOverTime: new ConstantValue(4),
            emissionOverDistance: new ConstantValue(1),

            material: paddleConfigParts.mat,
            renderMode: RenderMode.Mesh,
            renderOrder: 25,
            startTileIndex: new ConstantValue(0),
            uTileCount: 1,
            vTileCount: 1,

            behaviors: [
                // new ForceOverLife(new ConstantValue(0), new ConstantValue(1), new ConstantValue(0)),
                // new LimitSpeedOverLife(new PiecewiseBezier([[new Bezier(0, 0, 0, 0), 0]]), 0.2),
                new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 1, 0, 0), 0]])),
                // @ts-ignore
                // new ColorOverLife(new ColorRange(new Vector4(1, 1, 1, 1), new Vector4(1, 1, 1, 0))),
                // new FrameOverLife(new PiecewiseBezier([[new Bezier(1, 1, 0, 0), 0]])),
            ],
        } as ParticleSystemParameters;
    }

    triggerFoam(x: number, y: number) {
        if (!focused()) return;
        
        const {
            batchSystem,
            scene,
        } = this;

        const splashPaddle = new ParticleSystem({
            ...this.paddleParticlesConfig,
            duration: 0.5,
            looping: false,
            emissionOverTime: new ConstantValue(1),
            emissionOverDistance: new ConstantValue(1),
        });

        splashPaddle.emitter.position.set(x, 0.1, y);
        splashPaddle.emitter.rotation.x = Math.PI * 0.5;

        batchSystem.addSystem(splashPaddle);
        scene.add(splashPaddle.emitter);
    }
    createFoamSpawner(mesh: Object3D) {
        const {
            batchSystem,
            // scene,
        } = this;

        const splashPaddle = new ParticleSystem(this.paddleParticlesConfig);

        splashPaddle.emitter.position.set(0, 0.1, 0);
        splashPaddle.emitter.rotation.x = Math.PI * 0.5;
        splashPaddle.emitter.scale.setScalar(7);

        batchSystem.addSystem(splashPaddle);
        mesh.add(splashPaddle.emitter);
    }
}