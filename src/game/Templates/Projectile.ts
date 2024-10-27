import { GameObjects, Scene } from "phaser";

export class Projectile {
    sprite: GameObjects.Sprite;

    constructor(public scene: Scene, spriteKey: string) {
        this.sprite = scene.add.sprite(0, 0, spriteKey);
    }
}