/* @refresh reload */
import { render } from 'solid-js/web';

import App from './App';
import { loadGLTF } from './game/commons/utils/loadGLTF';
import { MESH_NAMES } from './game/ship_repo';


const root = document.getElementById('root');

let totalLoaded = 0;
let TOTAL_ITEMS = 0;

const preloadItems = [
    loadGLTF('assets/models/ship.glb', MESH_NAMES.BASIC_1, () => {
        updateProgressBar();
    }),
    loadGLTF('assets/models/who-we-are.glb', MESH_NAMES.WHO_WE_ARE, () => {
        updateProgressBar();
    }),
    loadGLTF('assets/models/what-we-do.glb', MESH_NAMES.WHAT_WE_DO, () => {
        updateProgressBar();
    }),
    loadGLTF('assets/models/contact.glb', MESH_NAMES.CONTACT, () => {
        updateProgressBar();
    }),
    loadGLTF('assets/models/box.glb', MESH_NAMES.BOX, (gltf) => {
        updateProgressBar();
        // console.log('island:', gltf);
    }),
    loadGLTF('assets/models/KIGA.glb', MESH_NAMES.KIGA_GAMES, (gltf) => {
        updateProgressBar();
        // console.log('island:', gltf);
    }),
];

TOTAL_ITEMS = preloadItems.length;

console.log('TOTAL_ITEMS:', TOTAL_ITEMS);

function updateProgressBar() {
    ++totalLoaded;
    const bar = document.getElementById('progress-bar');

    if (bar) {
        bar.style.width = `${Math.min(100, (totalLoaded || 1) / TOTAL_ITEMS * 100)}%`;
    }
}

async function start() {
    await Promise.allSettled(preloadItems).then(() => {
        render(() => <App />, root!);
    });
}

start();