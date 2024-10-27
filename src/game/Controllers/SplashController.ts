import { AdditiveBlending, CircleGeometry, Color, DoubleSide, MeshBasicMaterial, Scene, SpriteMaterial, Vector4 } from "three";
import { BatchedRenderer, Bezier, ColorOverLife, ColorRange, ConeEmitter, ConstantValue, EmitterMode, ForceOverLife, IntervalValue, LimitSpeedOverLife, ParticleSystem, ParticleSystemParameters, PiecewiseBezier, RenderMode, SizeOverLife } from "three.quarks";
import { TEXTURE_NAMES, texture_repo } from "../texture_repo";
import { AudioController } from "./AudioController";
import { focused } from "../../App";

export class SplashController {
    public static instance: SplashController

    public static getInstance(scene?: Scene, batchSystem?: BatchedRenderer): SplashController {
        if (this.instance) {
            return this.instance;
        } else {
            if (!scene || !batchSystem) {
                throw new Error();
            } else {
                this.instance = new SplashController(scene, batchSystem);
            }

            return this.instance;
        }
    }

    public static triggerSplash(x: number, y: number, triggerAudio = true) {
        this.instance.triggerSplash(x, y, triggerAudio)
    }

    public static destroy() {
        // @ts-ignore
        SplashController.instance = null;
    }

    paddleParticlesConfig: ParticleSystemParameters;
    splashParticlesConfig: ParticleSystemParameters;

    private constructor(public scene: Scene, public batchSystem: BatchedRenderer) {
        //#region Paddle config
        const paddleConfigParts = {
            geom: new CircleGeometry(),
            mat: new MeshBasicMaterial({
                map: texture_repo[TEXTURE_NAMES.SPLASH_PADDLE],
                color: 0xffffff,
                transparent: true,
                side: DoubleSide,
                blending: AdditiveBlending,
            }),
        };

        this.paddleParticlesConfig = {
            autoDestroy: true,
            duration: 0.25,
            prewarm: true,
            looping: false,
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
            emissionBursts: [
                {
                    count: new ConstantValue(1),
                    cycle: 1,
                    interval: 0,
                    probability: 0.1,
                    time: 0.1,
                }
            ],
            startRotation: new ConstantValue(200),

            // startLife: new IntervalValue(0.25, 0.34),
            // startSpeed: new IntervalValue(0.1 + this.maxSpeed, 0.1 + this.maxSpeed),
            // endSpeed: new IntervalValue(2 + this.maxSpeed, 2 + this.maxSpeed),
            startSize: new ConstantValue(0.52),
            // endSize: new ConstantValue(0.0),
            // startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            emissionOverTime: new ConstantValue(1),

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

        // #region Water splash upwards config
        const splashConfigParts = {
            geom: new CircleGeometry(),
            mat: new SpriteMaterial({
                map: texture_repo[TEXTURE_NAMES.SPLASH],
                color: 0xffffff,
                transparent: true,
                opacity: .07,
                side: DoubleSide,
                blending: AdditiveBlending,
            }),
        };
        this.splashParticlesConfig = {
            duration: .5,
            looping: false,
            prewarm: true,
            autoDestroy: true,
            instancingGeometry: splashConfigParts.geom,
            worldSpace: true,

            shape: new ConeEmitter({
                radius: 0.01,
                arc: 6.2831,
                thickness: 1,
                angle: 0.122173,
                mode: EmitterMode.Random
            }),

            startRotation: new IntervalValue(0, Math.PI),
            // startLife: new IntervalValue(0.25, 0.34),
            startSpeed: new IntervalValue(0.1, 3.4),
            // endSpeed: new IntervalValue(-1, -12),
            startSize: new ConstantValue(0.25),
            // startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            emissionOverTime: new ConstantValue(140),

            material: splashConfigParts.mat,
            // renderMode: RenderMode.Mesh,
            renderMode: RenderMode.BillBoard,
            renderOrder: 25,
            startTileIndex: new ConstantValue(0),
            uTileCount: 1,
            vTileCount: 1,

            behaviors: [
                new ForceOverLife(new ConstantValue(0), new ConstantValue(-2.5), new ConstantValue(0)),
                new LimitSpeedOverLife(new PiecewiseBezier([[new Bezier(0, 0, 0, 0), 0]]), 0.12),
                // new SpeedOverLife(new PiecewiseBezier([[new Bezier(0, 0, -1, -1), 0]])),
                // new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 1, 0, 0), 0]])),
                // @ts-ignore
                new ColorOverLife(
                    // @ts-ignore
                    new ColorRange(
                        // new Vector4(...new Color(0x1993cd).toArray()),
                        new Vector4(...new Color(0xffffff).toArray()),
                        // new Vector4(...new Color(0x1993cd).toArray())
                        new Vector4(...new Color(0xffffff).toArray())
                    )
                ),
            ],
        } as ParticleSystemParameters;
    }

    triggerSplash(x: number, y: number, triggerAudio = true) {
        if (!focused()) return;
        
        const {
            batchSystem,
            scene,
        } = this;

        const splashPaddle = new ParticleSystem(this.paddleParticlesConfig);
        const splash = new ParticleSystem(this.splashParticlesConfig);

        splashPaddle.emitter.position.set(x, 0.1, y);
        splashPaddle.emitter.rotation.x = Math.PI * 0.5;
        splash.emitter.position.set(x, 0.1, y);
        splash.emitter.rotation.x = Math.PI * -0.5;

        batchSystem.addSystem(splashPaddle);
        batchSystem.addSystem(splash);
        scene.add(splashPaddle.emitter);
        scene.add(splash.emitter);

        triggerAudio && AudioController.getInstance().playShipSink(splashPaddle.emitter);
    }
}
