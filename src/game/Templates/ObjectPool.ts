import { BoxGeometry, CircleGeometry, CylinderGeometry, DoubleSide, Mesh, MeshStandardMaterial, Object3D, Scene, SphereGeometry } from "three";
import { MISSILE_LENGTH, MISSILE_TIP_RADIUS } from "../constants";
import { MESH_NAMES, mesh_repo } from "../ship_repo";
import { cloneMesh } from "../commons/utils/cloneMesh";

export class ObjectPool {
    active: ObjectPoolItem[] = []
    pool: ObjectPoolItem[] = []

    constructor(public count = 25, public scene: Scene) {
        this.pool = (new Array(count)).fill(0).map(_ => new ObjectPoolItem(this));
    }

    getItem(x: number, y: number): ObjectPoolItem {
        const item = this.pool.shift();

        if (item) {
            item.activate(x, y);

            return item;
        } else {
            const item = new ObjectPoolItem(this);
            item.activate(x, y);

            this.active.push(item);

            return item;
        }
    }
}

class ObjectPoolItem {
    mesh: Object3D
    isHit = false

    constructor(public objectPool: ObjectPool) {
        this.mesh = new Object3D();

        this.mesh.frustumCulled = false;

        this.mesh.position.y = 10000;

        // const m = new Mesh(new CylinderGeometry(MISSILE_TIP_RADIUS, MISSILE_TIP_RADIUS, MISSILE_LENGTH), new MeshStandardMaterial({
        //     color: 0xff0000,
        // }));

        const missileMesh = cloneMesh(mesh_repo[MESH_NAMES.MISSILE].scene as any, true);
        missileMesh.rotation.y = -Math.PI * 0.5;

        // const colliderCircle = new Mesh(new BoxGeometry(MISSILE_TIP_RADIUS * 2, MISSILE_TIP_RADIUS * 2, MISSILE_TIP_RADIUS * 2), new MeshStandardMaterial({
        //     color: 'green',
        //     side: DoubleSide,
        //     // depthTest: false,
        // }));
        // colliderCircle.rotation.x = Math.PI * 0.5;
        // colliderCircle.position.z = MISSILE_LENGTH * 0.5 - MISSILE_TIP_RADIUS;

        // m.rotation.x = Math.PI * 0.5;

        // this.mesh.add(m);
        // this.mesh.add(colliderCircle);
        
        this.mesh.add(missileMesh);
        this.objectPool.scene.add(this.mesh);
    }

    activate(x: number, y: number) {
        this.mesh.position.x = x;
        this.mesh.position.z = y;
        this.mesh.position.y = 0;
        this.mesh.visible = true;
        this.objectPool.active.push(this);
    }

    deactivate() {
        this.mesh.visible = false;
        this.mesh.position.y = 10000;
        this.isHit = false;

        const activePool = this.objectPool.active;

        for (let ix = 0, length = activePool.length; ix < length; ix++) {
            if (activePool[ix] == this) {
                activePool.splice(ix, 1);

                break;
            }
        }

        this.objectPool.pool.push(this);
    }
}