import { createEffect } from "solid-js";
import { Color, Mesh, MeshBasicMaterial, Object3D, Raycaster, RingGeometry, Scene } from "three";
import { ParticleSystem } from "three.quarks";
import { reload_time_attr } from "../../App";
import { ATTRIBUTE_DEFAULTS } from "../constants";
import { AudioController } from "../Controllers/AudioController";
import { Player } from "./Player";
import { Tween } from "@tweenjs/tween.js";
import { cloneMesh } from "../commons/utils/cloneMesh";

const ringSize = 7;
const indicatorMesh = new Mesh(new RingGeometry(ringSize * 0.52, ringSize * 0.59, 32, 1, Math.PI * 0.25, Math.PI * 0.5), new MeshBasicMaterial({
    color: 'lightgrey',
    transparent: true,
}));
indicatorMesh.position.y = 1;
indicatorMesh.rotation.x = Math.PI * -0.5;

// currentPlayerIndicator.name = 'PLAYER_INDICATOR';

export class Battery {
    scene: Scene;
    guns: Object3D[] = [];
    nextFire = 0;
    emitterSystems: ParticleSystem[] = [];
    reloadTime = ATTRIBUTE_DEFAULTS.RELOAD_TIME;
    raycasters: Raycaster[] = [];
    firingPattern: number[] = [];
    indicator: Mesh;

    constructor(public direction: number, indicatorDir: number, public startRange: number, public endRange: number, public player: Player) {
        createEffect(() => {
            this.reloadTime = ATTRIBUTE_DEFAULTS.RELOAD_TIME + -reload_time_attr();
        });

        this.indicator = cloneMesh(indicatorMesh);

        this.indicator.rotation.z = indicatorDir;

        this.player.mesh.add(this.indicator);
    }

    addGun(gun: Object3D) {
        this.guns.push(gun);
        this.raycasters.push(new Raycaster());

        this.firingPattern.push(Math.random() * 250);
    }

    fire() {
        const {
            firingPattern,
        } = this;

        this.emitterSystems.forEach((gun, ix) => {
            setTimeout(() => {
                gun.restart();
                AudioController.getInstance().playGunFire(this.player.mesh, false);
            }, firingPattern[ix]);
        });

        this.indicator.visible = false;
        (this.indicator.material as MeshBasicMaterial).opacity = 0;
        setTimeout(() => {
            this.indicator.visible = true;
            new Tween(this.indicator.material)
            .to({
                opacity: 1,
            })
            .duration(140)
            .start();
            // (this.indicator.material as MeshBasicMaterial).opacity = 0;
        }, this.reloadTime);
    }
}