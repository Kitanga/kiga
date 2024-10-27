import { Tween } from "@tweenjs/tween.js";
import { Entity } from "../../Templates/Entity";
import { Player } from "../../Templates/Player";
import { AudioController } from "../../Controllers/AudioController";
import { SHIP_SCALES } from "../../ship_repo";
import { cloneMesh } from "./cloneMesh";

export const killAnim = (entity: Player | Entity) => {
    if (entity && entity.mesh && entity.mesh.children) {
        entity.mesh.children.forEach(child => {
            if (child.type == 'Audio') {
                child.removeFromParent();
            }
        })
    }
    const deathBoat = cloneMesh(entity.mesh as any, false);

    deathBoat.scale.setScalar(SHIP_SCALES.BASIC_1);

    deathBoat.position.copy(entity.mesh.position);
    deathBoat.rotation.copy(entity.mesh.rotation);
    deathBoat.rotation.y += Math.PI;

    // entity.meshSubstitute.position.y = 400000;

    // @ts-ignore
    // deathBoat.children[0].material.visible = false;

    entity.scene.add(deathBoat);

    AudioController.getInstance().playShipSink(deathBoat);

    new Tween(deathBoat.rotation)
        .to({
            z: (Math.random() > 0.5 ? 1 : -1) * Math.PI * 0.43,
        })
        .duration(1.4 * 1000)
        .onUpdate(() => {
            // 
            if (entity.health < 1) {
                entity.meshSubstitute.rotation.copy(deathBoat.rotation);
                entity.instanceController.updateMesh(entity.instanceIX, entity.meshSubstitute);
                entity.instanceController.prepareToUpdate();
            }
        })
        .onComplete(() => {
            if (entity.health < 1) {
                entity.meshSubstitute.rotation.z = 0;
                entity.instanceController.updateMesh(entity.instanceIX, entity.meshSubstitute);
                entity.instanceController.prepareToUpdate();
            }
        })
        .start();
    new Tween(deathBoat.position)
        .to({
            y: -5.2
        })
        .duration(5 * 1000)
        .onUpdate(() => {
            // 
            if (entity.health < 1) {
                entity.meshSubstitute.position.copy(deathBoat.position);
                entity.instanceController.updateMesh(entity.instanceIX, entity.meshSubstitute);
                entity.instanceController.prepareToUpdate();
            }
        })
        .onComplete(() => {
            deathBoat.removeFromParent();
        })
        .start();
}