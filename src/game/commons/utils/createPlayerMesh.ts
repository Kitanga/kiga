import { BoxGeometry, DoubleSide, Group, Mesh, MeshStandardMaterial, Object3D } from "three";
import { SHIP_SCALES } from "../../ship_repo";

export const geomXWidth = 4.117;
const y = 1.0;
const zHeight = 1.439;

const shipGeom = new BoxGeometry(geomXWidth * 2, y * 2, zHeight * 2);
const mat = new MeshStandardMaterial(
    {
        transparent: true,
        opacity: 0,
        depthTest: false,
        side: DoubleSide,
    }
);

shipGeom.computeBoundingBox();
shipGeom.computeVertexNormals();

export const createPlayerMesh = () => {
    const gameObj = new Group();
    const mesh = new Mesh(shipGeom, mat);

    gameObj.scale.multiplyScalar(SHIP_SCALES.BASIC_1);

    mesh.position.y = 1;

    
    const substitute = new Object3D();
    
    substitute.position.y = 1;
    substitute.scale.multiplyScalar(SHIP_SCALES.BASIC_1);
    // substitute.rotation.y = -Math.PI * 0.5;
    
    mesh.visible = false;
    
    gameObj.add(mesh);
    // gameObj.add(substitute);

    return {
        gameObj,
        substitute,
    };
}