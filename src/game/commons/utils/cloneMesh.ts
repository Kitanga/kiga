import { Mesh } from "three";

export const cloneMesh = (mesh: Mesh, deep = true): Mesh => {
    const newMesh = mesh.clone(deep);
    
    newMesh.traverse(obj => {
        if (obj instanceof Mesh) {
            if (obj.material) {
                obj.material = obj.material.clone()
            }
        }
    });

    return newMesh;
}