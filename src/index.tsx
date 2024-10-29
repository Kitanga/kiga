/* @refresh reload */
import { render } from 'solid-js/web';

import RAPIER from '@dimforge/rapier2d-compat';
import { AudioLoader } from 'three';
import App, { set_username } from './App';
import { AUDIO_NAMES, audio_repo } from './game/audio_repo';
import { LocalStorageKeys } from './game/commons/enums/LocalStorageKeys';
import { loadAndCacheTexture } from './game/commons/utils/loadAndCacheTexture';
import { loadGLTF } from './game/commons/utils/loadGLTF';
import { loadSailTexture } from './game/commons/utils/loadSailTexture';
import { CrazyGamesController } from './game/commons/vendors/CrazyGamesController';
import { PokiController } from './game/commons/vendors/PokiController';
import { AnalyticsController } from './game/Controllers/AnalyticsController';
import { LocalStorageController } from './game/Controllers/LocalStorageController';
import { EventBus } from './game/EventBus';
import { MESH_NAMES } from './game/ship_repo';
import { TEXTURE_NAMES } from './game/texture_repo';

await RAPIER.init();
// if (window.location !== window.parent.location || window.location.hostname.includes('localhost')) {
//     // Iframed

// const rotationPrompt = new DeviceRotationPrompt({
//     mobileDetect: true,
//     orientation: DeviceOrientation.Landscape,
//     zIndex: 10000,
// });

const analytics = AnalyticsController.getInstance();

(window as any).EventBus = EventBus;
// (window as any).IS_CRAZY_GAMES && await new Promise(res => {
//     const intervalID = setInterval(() => {
//         const CG = (window as any).CrazyGames;

//         if (CG) {
//             console.log('check:');
//             clearInterval(intervalID);
//             res(CG.SDK.init());
//         }
//     }, 140);
// });
(window as any).IS_POKI && await new Promise(res => {
    const intervalID = setInterval(() => {
        const _POKI = (window as any).PokiSDK;

        if (_POKI) {
            console.log('check:');
            clearInterval(intervalID);
            res(_POKI.init());
        }
    }, 140);
});
(window as any).IS_GD && await new Promise(res => {
    // const intervalID = setInterval(() => {
    //     const _POKI = (window as any).gdsdk;

    //     if (_POKI) {
    //         console.log('check:');
    //         clearInterval(intervalID);
    //         res(_POKI.init());
    //     }
    // }, 140);
});

const root = document.getElementById('root');

const audioLoader = new AudioLoader();

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
    loadGLTF('assets/models/missile.glb', MESH_NAMES.MISSILE, () => {
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
    ...[
        [AUDIO_NAMES.SHIP_SINK, 'ship-sink-freq-500.m4a'],
        [AUDIO_NAMES.GUN_FIRE, 'gun-fire-freq-500.m4a'],
        [AUDIO_NAMES.GUN_FIRE_TAIL, 'gun-fire-tail-freq-500.m4a'],
        [AUDIO_NAMES.NO_GUN_FIRE, 'no-fire.m4a'],
        [AUDIO_NAMES.LEVEL_UP_SHOUT, 'level-up-shout-2.m4a'],
        [AUDIO_NAMES.PICK_UP, 'pickup.m4a'],
        [AUDIO_NAMES.GAME_OVER, 'gameover.m4a'],
        [AUDIO_NAMES.BOSS, 'boss.m4a'],
        [AUDIO_NAMES.SHIP_HIT, 'hit-crack.m4a'],
    ].map(([key, slug]) => {
        return new Promise<void>(res => {
            audioLoader.load('snd/' + slug, function (buffer) {
                updateProgressBar();
                res();
                audio_repo[key] = buffer;
                console.log('Key:', key)
            });
        })
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
    if ((window as any).IS_CRAZY_GAMES && ['local', 'crazygames'].includes((window as any)?.CrazyGames?.SDK?.environment)) {
        const CG = (window as any).CrazyGames;

        // await CG.SDK.init();
        const CGC = CrazyGamesController.getInstance();
        if (CG.SDK.user.isUserAccountAvailable) {
            // Get user name
            const user: { username: string } = await CGC.getUser();

            console.log('user data:', CG.SDK.user.systemInfo);

            if (user && !LocalStorageController.getItem(LocalStorageKeys.USERNAME)) {
                const uName = user.username;

                set_username(uName);
                LocalStorageController.setItem(LocalStorageKeys.USERNAME, uName);
            }
        }
        CrazyGamesController.getInstance().startLoading();
    } else if ((window as any).IS_POKI) {
        // const Poki = PokiController.getInstance();

        const params = new URLSearchParams(location.search);
        const country = params.get('country');

        // if (NetController.DEFAULT_SERVER_OPTION !== SERVER_OPTION_NAMES.US_EAST) {
        //     await multiPing();
        // }
    }

    analytics.logLoadingStarted();

    await Promise.allSettled(preloadItems).then(() => {
        analytics.logLoadingEnded();
        CrazyGamesController.getInstance().stopLoading();
        PokiController.getInstance().stopLoading();
        render(() => <App />, root!);
    });
}

start();
// }
// TODO: add a check for when you are local above so that you can continue testing locally
// else {
//     const redirectMessage = document.getElementById('redirect-msg');

//     if (redirectMessage) {
//         redirectMessage.style.display = 'flex';

//         let count = 5;

//         redirectMessage.innerHTML = `Redirecting you to CrazyGames/Sunbaked in ${count} seconds`;

//         setInterval(() => {
//             redirectMessage.innerHTML = `Redirecting you to CrazyGames/Sunbaked in ${--count} seconds`;

//             if (count <= 0) {
//                 location.href = 'https://www.crazygames.com/game/sunbaked';
//             }
//         }, 1000);
//     }
// }
