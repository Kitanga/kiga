import {
    ACESFilmicToneMapping,
    AmbientLight,
    AudioListener,
    Clock,
    Color,
    DirectionalLight,
    HemisphereLight,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    PMREMGenerator,
    Raycaster,
    Scene,
    Texture,
    Vector2,
    Vector3,
    WebGLRenderer,
    WebGLRenderTarget
} from "three";
import { EffectComposer, Font, OutputPass, RenderPixelatedPass, Sky, TextGeometry, Water, WebGL } from "three/examples/jsm/Addons.js";
import WebGPU from "three/examples/jsm/capabilities/WebGPU.js";
import { color, normalWorld } from "three/examples/jsm/nodes/Nodes.js";
import { MESH_NAMES, mesh_repo, SHIP_SCALES } from "../game/ship_repo";

import TWEEN, { Easing, Tween } from '@tweenjs/tween.js';
import { createEffect } from "solid-js";
import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json';
import { lerp } from "three/src/math/MathUtils.js";
import { is_mobile, mute, PageNames, selected_sail, set_current_page, set_game_over, set_should_start_game, set_show_loader, set_show_tutorial, show_sail_customs, temporary_selected_sail } from "../App";
import { AudioController } from "../game/Controllers/AudioController";
import { LocalStorageController } from "../game/Controllers/LocalStorageController";
import { SAIL_NAMES } from "../game/commons/customizations/sails";
import { LocalStorageKeys } from "../game/commons/enums/LocalStorageKeys";
import { cloneMesh } from "../game/commons/utils/cloneMesh";
import { sailsChangeMat } from "../game/commons/utils/sailsChangeMat";
import { SAIL_MAT_NAME, SAILS_DEFAULT_COLOR } from "../game/constants";
import { TEXTURE_NAMES, texture_repo } from "../game/texture_repo";
import { AnalyticsController } from "../game/Controllers/AnalyticsController";


export function SBMainMenu(parent: string) {
    console.log('game renderered');

    let buttonActive = false;

    let camera: PerspectiveCamera;
    let scene: Scene;
    let renderer: WebGLRenderer;

    const raycaster = new Raycaster();

    const clock = new Clock();

    let last = performance.now();

    if (WebGPU.isAvailable() === false && WebGL.isWebGL2Available() === false) {

        document.body.appendChild(WebGPU.getErrorMessage());

        throw new Error('No WebGPU or WebGL2 support');

    }

    camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 30000);
    camera.position.set(0, 3, 14);

    scene = new Scene();
    scene.environmentIntensity = 0.34;

    // @ts-ignore
    scene.backgroundNode = normalWorld.y.mix(color(0x0487e2), color(0xb8e2f5));
    // camera.lookAt(0, 1, 0);

    // const cameraTween = new Tween(camera.position)
    //     .to({})

    // const v2 = new Vector2(0 - camera.position.x, 0 - camera.position.z);
    // const xAngle = v2.angle();

    function animateIntro() {
        camera.rotation.x = -Math.PI * 0.5;

        const kigaMesh = mesh_repo[MESH_NAMES.KIGA_GAMES].scene;
        kigaMesh.frustumCulled = false;

        kigaMesh.scale.setScalar((window as any).PORTRAIT_ORIENTATION ? 1.4 : 2.5);

        kigaMesh.position.setY(0.1).setZ(camera.position.z);

        scene.add(kigaMesh);

        console.log('WEB_VENDOR:', (window as any).WEB_VENDOR);
        const sponsorMeshKey = (window as any).WEB_VENDOR || MESH_NAMES.SPONSOR_LOGO;
        const sponsorMesh = mesh_repo[sponsorMeshKey].scene;
        // const sponsorMesh = createText('Sponsor/nLogo', );
        sponsorMesh.frustumCulled = false;

        sponsorMeshKey == MESH_NAMES.SPONSOR_LOGO && sponsorMesh.scale.setScalar(0.52);
        sponsorMeshKey == MESH_NAMES.CRAZY_GAMES && sponsorMesh.scale.setScalar(2.5);
        sponsorMeshKey == MESH_NAMES.POKI && sponsorMesh.scale.setScalar(3);
        sponsorMeshKey == MESH_NAMES.NEWGROUNDS && sponsorMesh.scale.setScalar(2.5);
        sponsorMeshKey == MESH_NAMES.ITCHIO && sponsorMesh.scale.setScalar(8);
        sponsorMeshKey == MESH_NAMES.GAMEJOLT && sponsorMesh.scale.setScalar(14);

        (window as any).PORTRAIT_ORIENTATION && sponsorMesh.scale.multiplyScalar(0.5);

        sponsorMesh.position.setY(0.1).setZ(camera.position.z - 3.4);

        scene.add(sponsorMesh);

        const finalCameraPosition = {
            x: 0,
            y: 3,
            z: 3,
        };
        const finalCameraRotation = {
            x: [camera.rotation.x, camera.rotation.x, lerp(camera.rotation.x, -0.7853981633974484, 0.5), -0.7853981633974484],
            y: 0,
            z: 0,
        };

        const duration = 5.2 * 1000;
        const delay = 1.4 * 1000;

        // const durationRatio = 0.052;

        let skipped = false;
        const mainMenuUI = document.getElementById('main-menu')!;

        mainMenuUI.style.transform = 'translateY(-10px)';
        mainMenuUI.style.opacity = '0';

        mainMenuUI.style.pointerEvents = 'none';

        // const finalUIStyles = {
        //     translateY: 0,
        //     opacity: 1,
        // };

        const mainMenuEnd = () => {
            if (mainMenuUI) {
                mainMenuUI.style.transform = 'translateY(' + lerp(-10, 0, 1) + 'px)';
                mainMenuUI.style.opacity = lerp(0, 1, 1) + '';
                mainMenuUI.style.pointerEvents = '';
            }
        }

        const showAd = () => {
            buttonActive = true;
            //#region request banner ad
            console.log('request new banner on main menu');
            // cycleBanner('menu-banner', () => current_page() == PageNames.HOME);
        };

        const cameraPosTween = new Tween(camera.position)
            .to(finalCameraPosition)
            .delay(delay)
            .duration(duration)
            .easing(Easing.Sinusoidal.In)
            .start();

        const cameraRotTween = new Tween(camera.rotation)
            .to(finalCameraRotation)
            .onComplete(() => {
                if (!skipped) {
                    skipped = true;
                    // camera.rotation.x = finalCameraRotation.x;
                    // camera.position.z = finalCameraPosition.z;
                    mainMenuEnd();

                    showAd();
                }
            })
            .delay(delay)
            .duration(duration)
            .easing(Easing.Sinusoidal.InOut)
            .start();

        // const uiTween = new Tween({
        //     opacity: 0,
        //     translateY: 0,
        // })
        //     .to(finalUIStyles)
        //     .onUpdate((obj) => {
        //         if (!skipped) {
        //             // camera.rotation.x = obj.x;
        //             mainMenuUI.style.transform = 'translateY(' + obj.translateY + 'px)';
        //             mainMenuUI.style.opacity = obj.opacity + '';
        //         }
        //     })
        //     .onComplete(() => {
        //         skipped = true;
        //         if (mainMenuUI) {
        //             mainMenuUI.style.transform = 'translateY(' + lerp(10, 0, 1) + 'px)';
        //             mainMenuUI.style.opacity = lerp(0, 1, 1) + '';
        //         }
        //     })
        //     .delay(duration - 5)
        //     .duration(1 * 1000)
        //     .easing(Easing.Quadratic.InOut)
        //     .start();
        // })
        // .start();

        const end = () => {
            if (!skipped) {
                skipped = true;
                cameraPosTween.stop().end();
                cameraRotTween.stop().end();
                showAd();
                // uiTween.end();

                mainMenuEnd();
            }

            window.removeEventListener('click', end);
        };
        
        window.addEventListener('click', end);
    }

    const sunLight = new DirectionalLight(0xFFE499, 5);
    sunLight.position.set(.5, 3, .5);

    const waterColour = 0x1993cd;

    scene.add(new AmbientLight(0x808080));

    const skyAmbientLight = new HemisphereLight(0x74ccf4, 0, 1);

    scene.add(sunLight);
    scene.add(skyAmbientLight);

    // renderer

    renderer = new WebGLRenderer({
        antialias: true,

    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    document.getElementById(parent)!.appendChild(renderer.domElement);

    // controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableRotate = false;
    // controls.enablePan = false;
    // // controls.enableZoom = false;
    // controls.minDistance = 4;
    // controls.maxDistance = 4;
    // controls.update();

    const SIZE = 100;
    // const TEXTURE_SIZE = 512;
    const TEXTURE_SIZE = 256;

    const waterGeometry = new PlaneGeometry(SIZE, SIZE);

    const water = new Water(waterGeometry,
        {
            textureWidth: TEXTURE_SIZE,
            textureHeight: TEXTURE_SIZE,
            waterNormals: texture_repo[TEXTURE_NAMES.WATER_NORMAL],
            eye: new Vector3(1, 4, 2),
            sunDirection: new Vector3(),
            // sunColor: 0xffffff,
            // sunColor: 0x2d64e1,
            // sunColor: 0x2ac5c5,
            sunColor: waterColour,
            waterColor: waterColour,
            // waterColor: 0x0000ff,
            distortionScale: 3.7,
            fog: scene.fog !== undefined,
        }
    );

    console.log('water:', water)

    const waterUniforms = water.material.uniforms;
    console.log('wu:', waterUniforms)
    // waterUniforms.distortionScale.value = 0.10;
    waterUniforms.distortionScale.value = 1;
    waterUniforms.size.value = 10;

    water.rotation.x = - Math.PI / 2;
    scene.add(water);

    const sun = new Vector3();

    const sky = new Sky();
    sky.scale.setScalar(SIZE);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    const parameters = {
        elevation: 2,
        azimuth: 180
    };

    const pmremGenerator = new PMREMGenerator(renderer as any);
    const sceneEnv = new Scene();

    let renderTarget: WebGLRenderTarget<Texture> | undefined;

    function updateSun() {

        const phi = MathUtils.degToRad(90 - parameters.elevation);
        const theta = MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();

        if (renderTarget !== undefined) renderTarget.dispose();

        sceneEnv.add(sky);
        renderTarget = pmremGenerator.fromScene(sceneEnv);
        scene.add(sky);

        scene.environment = renderTarget.texture;

    }

    updateSun();

    const mesh: Mesh = cloneMesh(mesh_repo[MESH_NAMES.BASIC_1].scene.clone() as any) as any;
    const sailsMeshGroup: Mesh = cloneMesh(mesh_repo[MESH_NAMES.BASIC_1_SAILS_DEFAULT].scene.clone() as any) as any;
    let sailsMesh: Mesh;
    mesh?.scale.multiplyScalar(SHIP_SCALES.BASIC_1);
    // sailsMesh.rotation
    mesh.rotation.y = Math.atan2(1, 0);
    sailsMeshGroup.rotation.y = Math.PI;
    const meshInner = mesh.children[0] as Mesh;
    meshInner.add(sailsMeshGroup);

    sailsMeshGroup.rotation.y = Math.PI;
    sailsMeshGroup.position.x = -1;
    sailsMeshGroup.position.y = -2;

    let sailsMaterials: MeshStandardMaterial[] = [];

    sailsMeshGroup.traverseVisible(child => {
        if (child instanceof Mesh && child?.material?.name == SAIL_MAT_NAME) {
            sailsMesh = child;
            sailsMaterials.push(child.material);
        }
    });

    // sailsMesh.material = new MeshStandardMaterial({
    //     color: 0xff0000,
    // });

    console.log('ship sails default:', SAILS_DEFAULT_COLOR.getHexString());
    console.log('ship:', meshInner);
    console.log('shipsail:', sailsMeshGroup);

    // @ts-ignore



    // camera.lookAt(mesh?.position);

    // TODO: use the code above and move it to player/entity
    meshInner.traverse(child => {
        if (child.name == "barrel_2") {
            sailsMeshGroup.rotation.y = Math.PI;
            sailsMeshGroup.position.x = -0.9;
            sailsMeshGroup.position.y = -1.7;
            sailsMeshGroup.position.z = 0.8;
            child.add(sailsMeshGroup);
            console.log('child added!!!');
        }
    });

    // console.log(sailsMesh.children[0].material as MeshStandardMaterial);
    // (sailsMesh.children[0].material as MeshStandardMaterial) = sailsMesh2.children[0].material.clone();

    // sailsMesh.material

    // meshInner.children[6].add(sailsMesh)
    scene.add(mesh);

    createEffect(() => {
        if (temporary_selected_sail() == undefined) {
            if (!sailsChangeMat(selected_sail() as SAIL_NAMES, sailsMesh)) {
                // sailsChangeMatReset(sailsMesh);
            }
        } else {
            sailsChangeMat(temporary_selected_sail() as SAIL_NAMES, sailsMesh)
        }
    });

    createEffect(() => {
        if (!sailsChangeMat(selected_sail() as SAIL_NAMES, sailsMesh)) {
            // sailsChangeMatReset(sailsMesh, sailsMaterials);
        }
    })

    const textGeom = new TextGeometry('START GAME', {
        font: new Font(helvetiker),
        size: 0.1,
        depth: 0.1,
        // curveSegments: 12,
        // bevelEnabled: false,
        // bevelThickness: 10,
        // bevelSize: 8,
        // bevelOffset: 0,
        // bevelSegments: 5,
    });

    textGeom.computeBoundingBox();

    const textMaterials = [
        new MeshPhongMaterial({ color: 0x0, flatShading: true }), // front
        new MeshPhongMaterial({ color: 0x0 }) // side
    ];

    const textMesh = new Mesh(textGeom, textMaterials);

    const button = new Mesh(new PlaneGeometry(1, 0.3, 4, 4), new MeshBasicMaterial({
        color: 0xDBA507,
    }));
    // const inputBG = new Mesh(new PlaneGeometry(0.75, 0.3, 4, 4), new MeshBasicMaterial({
    //     color: 0xffffff,
    //     opacity: 0.5,
    //     transparent: true,
    // }));

    button.add(textMesh);

    // button.rotation.z = Math.PI * 0.25;
    button.rotation.x = -Math.PI * 0.5;

    const textGeomSize = textGeom.boundingBox!.getSize(new Vector3())!;

    // textMesh.position.set(-0.13, -0.05, -0.08);
    textMesh.position.set(-textGeomSize.x * 0.5, -textGeomSize.y * 0.5, -0.095);
    button.position.set(0.0, 0.1, 1);

    // bgButton.position.copy(button.position);
    // bgButton.rotation.copy(button.rotation);
    // inputBG.rotation.copy(button.rotation);
    // bgButton.position.y -= 0.001;

    // scene.add(bgButton);
    scene.add(button);

    // mesh.frustumCulled = meshInner.frustumCulled = sailsMeshGroup.frustumCulled = button.frustumCulled = textMesh.frustumCulled = false;

    scene.traverse(child => {
        if (child.frustumCulled) {
            child.frustumCulled = false;
        }
    });

    // Post Processing
    const composer = new EffectComposer(renderer);
    const renderPixelatedPass = new RenderPixelatedPass(2, scene, camera);
    composer.addPass(renderPixelatedPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    const mouse = new Vector2();
    mouse.x = mouse.y = NaN;

    const audioListener = new AudioListener();

    scene.add(audioListener);

    AudioController.getInstance(audioListener).playMainMenuMusic();

    /** @type {HTMLAudioElement} */
    const switchAud = document.getElementById('switch-aud') as HTMLAudioElement;

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('pointerup', onClick);
    window.addEventListener('pointermove', onMouseMove);

    function playButtonSnd(volume = 0.07) {
        switchAud.muted = mute();
        switchAud.volume = volume;
        switchAud.currentTime = 0;
        switchAud.play();
    }

    function onClick() {
        if (!show_sail_customs()) {
            const results = raycast();
            
            console.log('result1:', results);
            
            if (results.length && buttonActive) {
                AnalyticsController.getInstance().logPlayButtonClicked();
                console.log('result2:', results);
                playButtonSnd();

                window.removeEventListener('resize', onWindowResize);
                window.removeEventListener('pointerup', onClick);
                window.removeEventListener('pointermove', onMouseMove);

                document.body.style.cursor = '';
                // @ts-ignore
                AudioController.instance = null;
                audioListener.removeFromParent();
                set_game_over(false);

                // CrazyGamesController.getInstance().clearAllBannerAds();

                if (!is_mobile() && !LocalStorageController.getItem(LocalStorageKeys.ONBOARDED)) {
                    set_should_start_game(true);
                    set_show_tutorial(true);
                } else {
                    set_show_loader(true);
                    set_current_page(PageNames.PLAY);
                }
            }
        }
    }

    let enteredButton = false;

    function onMouseMove(ev: MouseEvent) {
        mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;

        if (!show_sail_customs()) {
            const results = raycast();

            if (results.length) {
                // hover effect
                (button.material as MeshBasicMaterial).color = new Color(0x000);
                (textMesh.material as MeshPhongMaterial[])[0].color = new Color(0xffffff);
                document.body.style.cursor = 'pointer'

                if (!enteredButton) {
                    enteredButton = true;
                    playButtonSnd(0.01);
                }
            } else {
                enteredButton = false;
                // don't hover
                (button.material as MeshBasicMaterial).color = new Color(0xDBA507);
                (textMesh.material as MeshPhongMaterial[])[0].color = new Color(0x000);
                document.body.style.cursor = ''
            }
        }
    }

    function raycast() {
        raycaster.setFromCamera(mouse, camera);

        return raycaster.intersectObject(button);
    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {

        // const time = performance.now() * 0.001;
        const now = performance.now();
        const DT = now - last;
        const DT_RATIO = DT / 1000;
        last = now;

        if (DT_RATIO > 1) {
            return;
        }

        // controls.update();

        meshInner.rotation.x = lerp(
            meshInner.rotation.x,
            (0.07 * Math.sin(Math.PI * clock.getElapsedTime() / 3.4)),
            DT_RATIO
        );
        meshInner.rotation.z = lerp(
            meshInner.rotation.z,
            0.034 * Math.sin(Math.PI * clock.getElapsedTime() / 7),
            DT_RATIO
        );

        // sailsMesh.rotation.copy(meshInner.rotation);

        water.material.uniforms['time'].value += (1.0 / 60.0) * DT_RATIO * 7;

        TWEEN.update();

        // composer.render();
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    animateIntro();

    return {
        scene,
        camera,
        renderer,
    }
}