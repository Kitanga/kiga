import { DRACOLoader, GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { MESH_NAMES, mesh_repo } from "../../ship_repo";

const glbLoader = new GLTFLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath((window as any).IS_POKI ? 'draco/' : './draco/');
glbLoader.setDRACOLoader(dracoLoader);

export const loadGLTF = (url: string, assetName: MESH_NAMES, callBack = (_?: GLTF) => { }) => {
    return new Promise<[MESH_NAMES, GLTF]>(res => {
        glbLoader.load(url, function (gltf) {
            callBack(gltf);
            res([assetName, gltf]);
            mesh_repo[assetName] = gltf;
        });
    })
}