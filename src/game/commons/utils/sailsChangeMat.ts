import { Color, Mesh, MeshStandardMaterial } from "three";
import { ISailItem, sail_mat_repo, SAIL_NAMES, SAILS_CUSTOMIZATIONS } from "../customizations/sails";
import { texture_repo } from "../../texture_repo";
import { SAILS_DEFAULT_COLOR, SAILS_DEFAULT_MAT } from "../../constants";

export const sailsChangeMat = (skinName: SAIL_NAMES, sailsMesh: Mesh) => {
    console.log('skin name:', skinName)
    const skin = SAILS_CUSTOMIZATIONS.find(skin => skin.name == skinName);

    if (skin) {
        if (skin.value) {
            (sailsMesh.material as MeshStandardMaterial) = getSailsMaterial(skin, 'color') as MeshStandardMaterial;
        }
        else {
            (sailsMesh.material as MeshStandardMaterial) = getSailsMaterial(skin, 'texture') as MeshStandardMaterial;
        }
        console.log('ret:', true)
        return true;
    } else {
        console.log('ret:', false)
        return false;
    }
}

export const sailsChangeMatReset = (sailsMesh: Mesh) => {
    console.log('reset mat');
    (sailsMesh.material as MeshStandardMaterial) = getSailsMaterial() as MeshStandardMaterial;
}

const getSailsMaterial = (skin?: ISailItem, type?: 'texture' | 'color'): MeshStandardMaterial | undefined => {
    const skinName = skin?.name;

    const sailMat = sail_mat_repo[skinName!];

    if (sailMat) {
        return sailMat;
    } else {
        switch (type) {
            case 'color':
                return new MeshStandardMaterial({
                    color: new Color(skin?.value),
                });
            case 'texture':
                const texture = texture_repo[skin?.key!];

                if (texture) {
                    return new MeshStandardMaterial({
                        map: texture,
                    });
                }
                break;
            default:
                return SAILS_DEFAULT_MAT
        }
    }
}
