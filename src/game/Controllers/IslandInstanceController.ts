import { DynamicDrawUsage, InstancedMesh, Mesh, MeshStandardMaterial, Object3D } from "three";
import { MESH_NAMES, mesh_repo } from "../ship_repo";

export class IslandInstanceController {
    static instance: IslandInstanceController

    static getInstance(count?: number) {
        if (this.instance) {
            return this.instance;
        } else {
            return this.instance = new IslandInstanceController(count);
        }
    }

    instances: InstancedMesh

    latestInstanceIX = 0

    private constructor(public count = 700) {
        const mesh = mesh_repo[MESH_NAMES.ISLAND].scene.children[0] as Mesh;

        if (mesh) {
            const geom = mesh.geometry.clone();
            const mat = (mesh.material as MeshStandardMaterial).clone();

            const meshInst = this.instances = new InstancedMesh(geom, mat, count);

            meshInst.frustumCulled = false;

            meshInst.instanceMatrix.setUsage(DynamicDrawUsage);

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

    getInstanceID() {
        if (this.latestInstanceIX == this.count) {
            throw new Error("No more instances available");
        }
        
        return this.latestInstanceIX++;
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