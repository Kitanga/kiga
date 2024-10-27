import {
    ACESFilmicToneMapping,
    AmbientLight,
    DirectionalLight,
    HemisphereLight,
    MathUtils,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    PMREMGenerator,
    Scene,
    Texture,
    Vector3,
    WebGLRenderer,
    WebGLRenderTarget
} from "three";
import { Sky } from "three/examples/jsm/Addons.js";
import { color, normalWorld } from "three/examples/jsm/nodes/Nodes.js";
import { MESH_NAMES, mesh_repo, SHIP_SCALES } from "../game/ship_repo";

import TWEEN from '@tweenjs/tween.js';
import { createEffect } from "solid-js";
import { selected_sail, temporary_selected_sail } from "../App";
import { SAIL_NAMES } from "../game/commons/customizations/sails";
import { cloneMesh } from "../game/commons/utils/cloneMesh";
import { sailsChangeMat } from "../game/commons/utils/sailsChangeMat";
import { SAIL_MAT_NAME, SAILS_DEFAULT_COLOR } from "../game/constants";


export function SBShipPreviewer(parent: string) {
    console.log('main again?')

    const SIZE = 100;

    let camera: PerspectiveCamera;
    let scene: Scene;
    let renderer: WebGLRenderer;

    let last = performance.now();

    camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 500);

    scene = new Scene();
    scene.environmentIntensity = 0.34;

    // @ts-ignore
    scene.backgroundNode = normalWorld.y.mix(color(0x0487e2), color(0xb8e2f5));
    // camera.lookAt(0, 1, 0);
    camera.position.set(0, 3, 3);
    camera.rotation.x = -0.7853981633974484;

    const sunLight = new DirectionalLight(0xFFE499, 5);
    sunLight.position.set(.5, 3, .5);

    scene.add(new AmbientLight(0xffffff));

    const skyAmbientLight = new HemisphereLight(0x74ccf4, 0, 1);

    scene.add(sunLight);
    scene.add(skyAmbientLight);

    const sky = new Sky();
    sky.scale.setScalar(SIZE * 1.5);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    const sun = new Vector3();

    const parameters = {
        elevation: 2,
        azimuth: 180
    };

    // #region renderer
    renderer = new WebGLRenderer({
        antialias: !(window.devicePixelRatio > 1),
        // powerPreference: 'low-power',
        powerPreference: 'high-performance',
        // alpha: false,
        // preserveDrawingBuffer: true,
    });

    const domEle = renderer.domElement;
    domEle.setAttribute('tabindex', '0');
    domEle.style.width = window.innerWidth + 'px';
    domEle.style.height = window.innerHeight + 'px';

    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    document.getElementById(parent)?.appendChild(renderer.domElement);

    const pmremGenerator = new PMREMGenerator(renderer as any);
    const sceneEnv = new Scene();

    let renderTarget: WebGLRenderTarget<Texture> | undefined;

    function updateSun() {
        const phi = MathUtils.degToRad(90 - parameters.elevation);
        const theta = MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);

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

    function onWindowResize() {
        const shipPreviewerInner = document.getElementById('ship-previewer-wrapper');

        if (!shipPreviewerInner) return;

        const bounds = shipPreviewerInner.getBoundingClientRect();
        const SCALE = 3;

        const width = bounds.width;
        const height = width * 2;
        const aspectRatio = width / height;
        camera.aspect = aspectRatio;
        camera.updateProjectionMatrix();

        renderer.setSize(width * SCALE, height * SCALE);

        const domEle = renderer.domElement;
        domEle.style.width = width + 'px';
        domEle.style.height = height + 'px';
    }

    onWindowResize();

    // window.onblur = () => {
    //     player.resetInputs();
    // };

    window.addEventListener('resize', onWindowResize);

    function animate() {
        // stats.begin();

        const now = performance.now();
        const DT = now - last;
        const DT_RATIO = DT / 1000;
        last = now;

        if (DT_RATIO > 1) {
            return;
        }

        TWEEN.update();


        renderer.render(scene, camera);
        // stats.end();
    }

    renderer.setAnimationLoop(animate);

    // @ts-ignore Observe a scene or a renderer
    if (typeof __THREE_DEVTOOLS__ !== 'undefined') {
        // @ts-ignore
        __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: scene }));
        // @ts-ignore
        __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: renderer }));
    }

    return {
        scene,
        camera,
        renderer,
        cleanup: () => {
            console.log('cleanup!:')
            scene.traverse(child => {
                // @ts-ignore
                if (child?.dispose) {
                    // @ts-ignore
                    child.dispose();
                }
            });
            scene.clear();
            scene.removeFromParent();
            renderer.setAnimationLoop(null);
            renderer.dispose();

            window.removeEventListener('resize', onWindowResize);
        }
    }
}