import { GameObjects, Math, Scene } from "phaser";
import { IShipConfig } from "../../ship";

export class Ship {
    container: GameObjects.Container;
    
    constructor(
        scene: Scene,
        x: number | undefined,
        y: number | undefined,
        ship_config: IShipConfig
    ) {
        const { w: width, h: height } = ship_config;

        const half_width = width * 0.5;
        const half_height = height * 0.5;

        this.container = scene.add.container(x, y, ship_config.c.map(part => {
            const spr = scene.add.sprite(part.x - half_width, part.y - half_height, part.n);

            spr.setOrigin(0, 0);
            
            return spr;
        }));

        this.container.setSize(width, height);

    }
}