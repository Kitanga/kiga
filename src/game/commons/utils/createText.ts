import { Mesh, MeshBasicMaterial, Object3DEventMap } from 'three';
import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json'
import { Font, TextGeometry } from "three/examples/jsm/Addons.js"

const text_cache: { [key: string]: Mesh<TextGeometry, MeshBasicMaterial[], Object3DEventMap> } = {};

export const createText = (text: string, color = 0x0, size = 0.1) => {
    const cacheKey = `${text}-${color}-${size}`;
    const cachedVersion = text_cache[cacheKey];

    if (cachedVersion) {
        return cachedVersion;
    }

    const textGeom = new TextGeometry(text, {
        font: new Font(helvetiker),
        size,
        depth: 0.0,
    });
    textGeom.computeBoundingBox();

    const textMaterials = [
        // new MeshPhongMaterial({ color: 0xff2727, flatShading: true }), // front
        new MeshBasicMaterial({
            color,
            transparent: true,
        }), // front
        new MeshBasicMaterial({
            color: 0x0
        }) // side
    ];

    const textMesh = new Mesh(textGeom, textMaterials);

    text_cache[cacheKey] = textMesh;

    return textMesh;
}

;([
    ['HEALx2', 0x00ff00],
    ['SCOREx2', 0x00ff00],
    ['XPx2', 0x00ff00],
    ['+heal', 0x00ff00],
    ['+score', 0x00ff00],
    ['+XP', 0x00ff00],
    ['HEALTH BONUS', 0x00ff00],
    ['DAMAGE BONUS', 0x00ff00],
    ['SPEED BONUS', 0x00ff00],
    ['TURN SPEED BONUS', 0x00ff00],
    ['RANGE BONUS', 0x00ff00],
    ['RELOAD TIME BONUS', 0x00ff00],
] as const).forEach(([text, color, size = 0.34]) => {
    createText(text, color, size);
});