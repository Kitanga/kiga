import { Easing, Tween } from "@tweenjs/tween.js";
import { Mesh, MeshBasicMaterial, Scene, SphereGeometry, Vector3, Vector3Like } from "three";

const geom = new SphereGeometry(0.05, 4, 4);
const mat = new MeshBasicMaterial({
    color: 0x0,
});

export class CannonVolleyController {
    public static instance: CannonVolleyController;

    public static getInstance(scene?: Scene): CannonVolleyController {
        if (this.instance) {
            return this.instance;
        } else {
            if (!scene) {
                throw new Error();
            } else {
                this.instance = new CannonVolleyController(scene);
            }

            return this.instance;
        }
    }

    public static triggerCannonAnim(batteryPos: Vector3Like, hit: Vector3Like, duration: number) {
        this.instance.triggerCannonAnim(batteryPos, hit, duration);
    }

    public static destroy() {
        // @ts-ignore
        CannonVolleyController.instance = null;
    }

    cannonBalls: Mesh[] = [];

    private constructor(public scene: Scene) {
        // There are 11 cannons on a ship and 100 potential players.
        // I'm using 50 because I doubt all 100 units will be firing at the same time
        // this.cannonBalls = new Array(11 * 50);
    }

    triggerCannonAnim(batteryPos: Vector3Like, hit: Vector3Like, duration: number) {
            const ball = new Mesh(geom, mat);

            const ballPos = ball.position.copy(batteryPos);

            const midPoint = new Vector3()
                .copy(hit)
                .sub(ballPos)
                .divideScalar(2)
                .add(ballPos);

            new Tween(ballPos)
                .to({
                    x: [ballPos.x, midPoint.x, hit.x],
                    y: [ballPos.y, midPoint.y + 0.25, hit.y],
                    z: [ballPos.z, midPoint.z, hit.z],
                })
                .duration(duration)
                .easing(Easing.Cubic.Out)
                .onStart(() => {
                    this.scene.add(ball);
                })
                .onComplete(() => {
                    ball.removeFromParent();
                })
                .start()
    }
}