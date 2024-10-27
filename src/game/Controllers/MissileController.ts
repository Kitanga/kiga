import { Scene } from "three";
import { MISSILE_LENGTH, MISSILE_TIP_RADIUS, SpawnerTypes } from "../constants";
import { Counter } from "../Templates/Counter";
import { ObjectPool } from "../Templates/ObjectPool";
import { Tween } from "@tweenjs/tween.js";
import { randFloat } from "three/src/math/MathUtils.js";
import { Player } from "../Templates/Player";
import { distanceBetween } from "../commons/utils/distanceBetween";

export class MissileController {
    static instance: MissileController;

    static getInstance(scene?: Scene, player?: Player) {
        if (this.instance) {
            return this.instance;
        } else if (scene && player) {
            return this.instance = new MissileController(scene, player);
        } else {
            throw new Error('Scene is missing MC');
        }
    }

    counters: Map<SpawnerTypes, Counter> = new Map();
    missilesPool: ObjectPool;

    boundTop: number
    boundBottom: number
    boundLeft: number
    boundRight: number

    private constructor(public scene: Scene, public player: Player) {
        this.missilesPool = new ObjectPool(50, scene);
    }

    update(dt: number) {
        // Check that the spawn counter hasn't gone 
        const {
            player,
            counters,
        } = this;

        const pos = player.mesh.position;
        const radius = player.radius;

        counters.forEach(counter => {
            counter.update(dt);
        });

        this.missilesPool.active.forEach(missile => {
            const x = missile.mesh.position.x;
            const y = missile.mesh.position.z + MISSILE_LENGTH * 0.5 - MISSILE_TIP_RADIUS;

            if (!missile.isHit && !player.isHit && distanceBetween(pos.x, pos.z, x, y) < MISSILE_TIP_RADIUS + radius) {
                // player.isHit = true;

                missile.isHit = true;

                missile.deactivate();

                console.log('hit!!!!!!');
            }
        });
    }

    registerTopSpawnerCounter() {
        this.createSpawner(SpawnerTypes.TOP, 2500, () => {
            this.spawnTopMissile();
        });
    }

    spawnTopMissile() {
        console.log('Spawn missile top side!!');
        const x = randFloat(this.boundLeft, this.boundRight);
        const y = this.boundTop - 14;

        const missile = this.missilesPool.getItem(x, y);

        const rotations = Math.random() < 0.5 ? (Math.random() < 0.5 ? 4 : 7) : 2;

        const movementTween = new Tween
            ({
                y,
            })
            .to({
                y: this.boundBottom + 14
            })
            .duration(4300)
            .onUpdate((obj, prog) => {
                if (missile.isHit) {
                    movementTween.stop();
                } else {
                    missile.mesh.position.z = obj.y;
                    missile.mesh.rotation.z = Math.PI * rotations * prog;
                }
            })
            .onComplete(() => {
                missile.deactivate();
            })
            .start();
    }

    createSpawner(spawnerType: SpawnerTypes, maxWaitTime: number, callback: () => void, startImmediately = false) {
        this.counters.set(spawnerType, new Counter(maxWaitTime, callback.bind(this), startImmediately));
    }
}
