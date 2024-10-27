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
    loadGLTF('assets/models/missile.glb', MESH_NAMES.MISSILE, () => {
        updateProgressBar();
    }),
    loadGLTF('assets/models/Sponsor.glb', MESH_NAMES.SPONSOR_LOGO, (gltf) => {
        updateProgressBar();
        // console.log('island:', gltf);
    }),
    loadGLTF('assets/models/box.glb', MESH_NAMES.BOX, (gltf) => {
        updateProgressBar();
        // console.log('island:', gltf);
    }),
    loadGLTF('assets/models/KIGA.glb', MESH_NAMES.KIGA_GAMES, (gltf) => {
        updateProgressBar();
        // console.log('island:', gltf);
    }),
    loadGLTF('assets/models/sails/default/default-sails.gltf', MESH_NAMES.BASIC_1_SAILS_DEFAULT, () => {
        updateProgressBar();
    }),
    loadAndCacheTexture('form-50p.png', TEXTURE_NAMES.FOAM),
    loadAndCacheTexture('splash-paddle.png', TEXTURE_NAMES.SPLASH_PADDLE),
    loadAndCacheTexture('splash.png', TEXTURE_NAMES.SPLASH),
    ...[
        ...((window as any).IS_CRAZY_GAMES ? [
            TEXTURE_NAMES.CRAZY_GAMES_WHITE,
            TEXTURE_NAMES.CRAZY_GAMES_BLACK,
            TEXTURE_NAMES.CRAZY_GAMES_PURPLE,
        ] : []),
        TEXTURE_NAMES.CROSS,
        TEXTURE_NAMES.ZAMBIA,
        TEXTURE_NAMES.BELGIUM,
        TEXTURE_NAMES.GERMANY,
        TEXTURE_NAMES.USA,
        TEXTURE_NAMES.SA,
    ].map(textureName => loadSailTexture(textureName, textureName)),
    ...[
        [AUDIO_NAMES.HELP_WELCOME, 'Start_help_1.m4a'],
        [AUDIO_NAMES.HELP_MOVEMENT, 'Start_help_2.m4a'],
        [AUDIO_NAMES.HELP_FIRING, 'Start_help_3.m4a'],
        [AUDIO_NAMES.HELP_OUTRO, 'Start_help_4.m4a'],
        [AUDIO_NAMES.HELP_CRUISE_BARRELS, 'torpedo_help.m4a'],
        [AUDIO_NAMES.HELP_MOBILE_NO_SUPPORT, 'no_mobile.m4a'],
        [AUDIO_NAMES.CHAMPION_OF_THE_SEA, 'champion.m4a'],
        [AUDIO_NAMES.MAKE_THEM_REMEMBER, 'remember.m4a'],
        [AUDIO_NAMES.GET_BACK, 'get-back.m4a'],
    ].map(([key, slug]) => {
        return new Promise<void>(res => {
            audioLoader.load('snd/help-voice/' + slug, function (buffer) {
                updateProgressBar();
                res();
                audio_repo[key] = buffer;
            });
        })
    }),
    ...[
        [AUDIO_NAMES.SHIP_SINK, 'ship-sink-freq-500.m4a'],
        [AUDIO_NAMES.GUN_FIRE, 'gun-fire-freq-500.m4a'],
        [AUDIO_NAMES.GUN_FIRE_TAIL, 'gun-fire-tail-freq-500.m4a'],
        [AUDIO_NAMES.NO_GUN_FIRE, 'no-fire.m4a'],
        [AUDIO_NAMES.LEVEL_UP_SHOUT, 'level-up-shout-2.m4a'],
        [AUDIO_NAMES.PICK_UP, 'pickup.m4a'],
        // [AUDIO_NAMES.MAIN_MENU, 'main-menu.m4a'],
        [AUDIO_NAMES.GAME_OVER, 'gameover.m4a'],
        [AUDIO_NAMES.BOSS, 'boss.m4a'],
        [AUDIO_NAMES.SHIP_HIT, 'hit-crack.m4a'],
        // [AUDIO_NAMES.PICK_UP, 'switch21.ogg'],
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
    ...((window as any).IS_CRAZY_GAMES ? [
        loadGLTF('assets/models/CrazyGames.glb', MESH_NAMES.CRAZY_GAMES, (gltf) => {
            updateProgressBar();
        }),
    ] : []),
    ...((window as any).IS_POKI ? [
        loadGLTF('assets/models/poki.glb', MESH_NAMES.POKI, () => {
            updateProgressBar();
        }),
    ] : []),
    ...((window as any).IS_NEWGROUNDS ? [
        loadGLTF('assets/models/newgrounds.glb', MESH_NAMES.NEWGROUNDS, () => {
            updateProgressBar();
        }),
    ] : []),
    ...((window as any).IS_ITCHIO ? [
        loadGLTF('assets/models/itchio.glb', MESH_NAMES.ITCHIO, () => {
            updateProgressBar();
        }),
    ] : []),
    ...((window as any).IS_GAMEJOLT ? [
        loadGLTF('assets/models/gamejolt.glb', MESH_NAMES.GAMEJOLT, () => {
            updateProgressBar();
        }),
    ] : []),
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
