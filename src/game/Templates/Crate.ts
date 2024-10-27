import { BoxGeometry, Clock, InstancedMesh, Mesh, MeshPhongMaterial, Object3D, Scene } from "three";
import { lerp } from "three/src/math/MathUtils.js";
import { MAP_SPECIAL_INDICATOR } from "../constants";
import { MESH_NAMES, mesh_repo } from "../ship_repo";
import { cloneMesh } from "../commons/utils/cloneMesh";


export const instancedCrateMesh = new InstancedMesh(
    new BoxGeometry(1.4, 1.4, 1.4),
    new MeshPhongMaterial({
        color: 0x705147,
    }),
    1000,
);

for (let ix = 0, length = instancedCrateMesh.count; ix < length; ix++) {
    const dummy = new Object3D();

    dummy.position.y = 40000;
    dummy.updateMatrix();

    instancedCrateMesh.setMatrixAt(ix, dummy.matrix);
}
instancedCrateMesh.instanceMatrix.needsUpdate = true;

export class Crate {
    // mesh: typeof crateMesh;
    mesh: Object3D;
    clock = new Clock();
    xRot = Math.random() * 0.25;
    yRot = Math.random() * 0.25;
    zRot = Math.random() * 0.25;
    binKey: number;
    iMesh: InstancedMesh
    cta: any;

    constructor(public scene: Scene, x: number, y: number, public ix: number, public specialty: MAP_SPECIAL_INDICATOR) {
        // const mesh = this.mesh = (ship_repo[SHIP_NAMES.CRATE].scene as Object3D).clone() as Mesh;
        // const mesh = this.mesh = crateMesh.clone();
        let mesh = this.mesh = new Object3D();

        if (typeof specialty == 'number') {
            mesh = this.mesh = cloneMesh(mesh_repo[MESH_NAMES.CRATE].scene as any) as Mesh;

            mesh.scale.setScalar(0.52);

            const chestMesh = mesh_repo[MESH_NAMES.CRATE];

            console.log('chest:', chestMesh.scene)

            // this.iMesh = new InstancedMesh(chestMesh.scene)
            // (mesh.material as MeshPhongMaterial) = new MeshPhongMaterial({
            //     color: 0xe30000,
            // });
            mesh.position.set(x, -0.1, y);
        } else {
            mesh.scale.setScalar(0.14);
            this.iMesh = instancedCrateMesh;
            mesh.position.set(x, 0, y);
        }


        mesh.updateMatrix();

        scene.add(this.mesh);

        this.iMesh && !this.iMesh?.parent && scene.add(this.iMesh);
        this.iMesh?.setMatrixAt(ix, mesh.matrix);
    }

    update(dt: number) {
        const DT_RATIO = dt / 1000;

        const {
            clock,
            xRot,
            yRot,
            zRot,
            mesh,
            ix,
            iMesh,
        } = this;

        // iMesh.getMatrixAt(ix, meshVec.matrix);

        // TODO: add bombing here
        //#region Bobbing in water
        mesh.rotation.x = lerp(
            mesh.rotation.x,
            xRot * Math.sin(Math.PI * clock.getElapsedTime() / 3.4),
            DT_RATIO
        );
        mesh.rotation.y = lerp(
            mesh.rotation.y,
            yRot * Math.sin(Math.PI * clock.getElapsedTime() / 2.5),
            DT_RATIO
        );
        mesh.rotation.z = lerp(
            mesh.rotation.z,
            zRot * Math.sin(Math.PI * clock.getElapsedTime() / 5.2),
            DT_RATIO
        );

        // meshVec.updateMatrix();
        this.updateMatrix();

        iMesh && (iMesh.instanceMatrix.needsUpdate = true);
    }

    updateMatrix() {
        this.mesh.updateMatrix();
        this.iMesh?.setMatrixAt(this.ix, this.mesh.matrix);
    }
}