import { DynamicDrawUsage, InstancedMesh, Mesh, MeshStandardMaterial, Object3D } from "three";
import { MESH_NAMES, mesh_repo } from "../ship_repo";

export class ShipInstanceController {
    static instance: ShipInstanceController

    static getInstance(count?: number) {
        if (this.instance) {
            return this.instance;
        } else {
            return this.instance = new ShipInstanceController(count);
        }
    }

    instances: InstancedMesh

    latestInstanceIXList: number[] = [];

    private constructor(public count = 35) {
        const mesh = mesh_repo[MESH_NAMES.BASIC_1].scene.children[0] as Mesh;

        this.fillIXs();

        if (mesh) {
            const geom = mesh.geometry;
            const mat = (mesh.material as MeshStandardMaterial);

            const meshInst = this.instances = new InstancedMesh(geom, mat, count);

            meshInst.frustumCulled = false;

            for (let ix = 0; ix < count; ix++) {
                const dummy = new Object3D();

                dummy.position.y = 40000;
                dummy.updateMatrix();

                meshInst.setMatrixAt(ix, dummy.matrix);
            }
            meshInst.instanceMatrix.needsUpdate = true;
        } else {
            throw new Error('No Ship Mesh found');
        }
    }

    fillIXs() {
        this.latestInstanceIXList = new Array(this.count - 1).fill(0).map((_, ix) => ix + 1);
    }

    getInstanceID() {
        if (!this.latestInstanceIXList.length) {
            throw new Error("No more instances available");
        }

        const ix = this.latestInstanceIXList.pop();

        return ix;
    }

    returnInstanceID(ix: number) {
        this.latestInstanceIXList.push(ix);

        const substitute = new Object3D();
        substitute.position.setY(40000);

        this.updateMesh(ix, substitute);
    }

    updateMesh(ix: number, substitute: Object3D) {
        const {
            instances
        } = this;

        substitute.updateMatrix();

        instances.setMatrixAt(ix, substitute.matrix);
        instances.instanceMatrix.needsUpdate = true;
    }

    prepareToUpdate() {
        this.instances.instanceMatrix.needsUpdate = true;
    }
}