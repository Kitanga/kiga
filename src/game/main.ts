import { color, normalWorld, threshold } from 'three/nodes';

import WebGL from 'three/addons/capabilities/WebGL.js';
import WebGPU from 'three/addons/capabilities/WebGPU.js';

import TWEEN from '@tweenjs/tween.js';
import { ACESFilmicToneMapping, AmbientLight, BoxGeometry, DirectionalLight, DoubleSide, Fog, HemisphereLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Scene, SpotLight, Vector3, WebGLRenderer } from 'three';
import { BatchedParticleRenderer } from 'three.quarks';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { isChromeBook } from './constants';
import { AnalyticsController } from './Controllers/AnalyticsController';
import { MESH_NAMES, mesh_repo } from './ship_repo';
import { lerp } from 'three/src/math/MathUtils.js';
import { cloneMesh } from './commons/utils/cloneMesh';

// export const stats = new Stats();

// location.hostname.includes('localhost') && document.body.appendChild(stats.dom);

const StartGame = (parent: string) => {

    console.log('main again?')

    setTimeout(() => {
        const div = document.getElementById('game-over');
        if (div) {
            div.style.opacity = '1';
        }
    }, 1000);

    let camera: PerspectiveCamera;
    let scene: Scene;
    let renderer: WebGLRenderer;
    let controls: OrbitControls;

    let last = performance.now();

    const webGL2Available = WebGL.isWebGL2Available();

    if (webGL2Available === false) {

        document.body.appendChild(WebGPU.getErrorMessage());

        AnalyticsController.getInstance().logWebGLGPUError(webGL2Available);

        throw new Error('No WebGL2 support');
    }

    camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 500);

    scene = new Scene();
    scene.environmentIntensity = 0.34;
    scene.fog = new Fog(0x0, 3, 10);

    const box = mesh_repo[MESH_NAMES.BOX].scene;

    box.scale.multiplyScalar(0.5);

    // box.childern(child => {
    // if (child.type == 'DirectionalLight') {
    console.log('lights:', mesh_repo[MESH_NAMES.BOX])
    // }
    // })

    scene.add(box);

    // const boxLights = mesh_repo[MESH_NAMES.BOX_LIGHTS].scene;


    // scene.add(boxLights);

    const backCover = new Mesh(new PlaneGeometry(300, 300), new MeshBasicMaterial({
        color: 0x141414
    }));

    backCover.position.z = -7

    scene.add(backCover);

    console.log('scene:', scene)

    // @ts-ignore
    // scene.backgroundNode = normalWorld.y.mix(color(0x0487e2), color(0xb8e2f5));
    camera.lookAt(0, 1, 0);

    const light1 = new PointLight(
        // color
        0xffffff,
        // intensity
        500,
        // 
        0,
        2.0
    );
    light1.position.y = 3;

    const light2 = new SpotLight(0xffffff, 1000, 1000, Math.PI, 0.0, 1.0);

    light2.scale.multiplyScalar(0.25);

    light2.position.y = 90;

    // scene.add(light2);
    scene.add(light1);

    const START_BOX_LIGHTS_POS_Z = light1.position.z;


    const kigaMesh = mesh_repo[MESH_NAMES.KIGA_GAMES].scene;
    kigaMesh.frustumCulled = false;

    console.log('kigaMesh:', kigaMesh);

    kigaMesh.scale.setScalar((window as any).PORTRAIT_ORIENTATION ? 1.4 : 5.2);

    kigaMesh.position.y = 2.5;
    kigaMesh.position.z = 1;
    // kigaMesh.rotation.x = Math.PI * 0.5 - 0.34;
    kigaMesh.rotation.x = Math.PI * 0.5;

    const kigPos = kigaMesh.position.clone();

    const whoWeAre = mesh_repo[MESH_NAMES.WHO_WE_ARE].scene;

    whoWeAre.position.z = 14;
    whoWeAre.scale.multiplyScalar(1);

    const whatWeDo = mesh_repo[MESH_NAMES.WHAT_WE_DO].scene;

    whatWeDo.position.z = 14;
    whatWeDo.scale.multiplyScalar(1);

    [
        kigaMesh,
        whoWeAre,
        whatWeDo,
        // cloneMesh(whoWeAre as any, true),
    ].forEach((meshCont, ix) => {
        meshCont.rotation.x = Math.PI * 0.5;
        meshCont.position.y = 2.5;
        meshCont.position.z = (ix * 13) + 1;

        meshCont.traverseVisible(child => {
            if (child.type == 'Mesh') {
                const mesh = child as Mesh;
                mesh.material = new MeshBasicMaterial({
                    color: 0xffffff,
                });
            }
        });

        scene.add(meshCont);
    });


    const xOffsetMax = 3;
    // const xOffsetMin = -0.25;
    const yOffsetMax = 3;
    // const yOffsetMin = -0.25;

    const logoOffset = {
        x: 0,
        y: 0,
    };

    window.addEventListener('mousemove', ev => {
        logoOffset.x = (1 - (ev.clientX / window.innerWidth)) * xOffsetMax;
        logoOffset.y = (1 - (ev.clientY / window.innerHeight)) * yOffsetMax;
    });

    renderer = new WebGLRenderer({
        // antialias: !isChromeBook,
        // antialias: true,
        // powerPreference: 'low-power',
        powerPreference: 'high-performance',
        alpha: true,
        // alpha: false,
        // preserveDrawingBuffer: true,
    });

    const domEle = renderer.domElement;
    domEle.setAttribute('tabindex', '0');
    domEle.style.width = window.innerWidth * window.devicePixelRatio + 'px';
    domEle.style.height = window.innerHeight * window.devicePixelRatio + 'px';

    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    document.getElementById(parent)!.appendChild(renderer.domElement);
    camera.position.copy({ x: 0, y: 2.5, z: 7 });
    camera.lookAt(new Vector3(0, camera.position.y, 0));

    const resetForm = () => {
        // TODO: show form
        const contactForm = document.getElementById('contact-form');

        if (contactForm) {
            contactForm.style.transform = 'translateY(10%)';
            contactForm.style.opacity = '0';
        }
    };

    const START_CAM_POS_Z = camera.position.z;

    let scrollPos = 0;
    let scrollAmount = 0;
    let totalBarAmount = 0;
    let hasScrolled = false;
    let SCROLL_SIZE = 1;
    let SCROLL_AMOUNT_MAX = 3 * 12;

    let thresholds: {
        section: string
        threshold: number
        scrollPos: number
        callback?: () => void
    }[] = [
        {
            section: 'home',
            threshold: SCROLL_AMOUNT_MAX * 0.05,
            callback: () => {
                resetForm();
            },
        },
        {
            section: 'who-we-are',
            threshold: SCROLL_AMOUNT_MAX * 0.4,
            callback: () => {
                resetForm();
            },
        },
        {
            section: 'what-we-do',
            threshold: SCROLL_AMOUNT_MAX * 0.7,
            callback: () => {
                resetForm();
            },
        },
        {
            section: 'contact',
            threshold: SCROLL_AMOUNT_MAX * 1,
            callback: () => {
                const contactForm = document.getElementById('contact-form');

                if (contactForm) {
                    contactForm.style.transform = 'translateY(0)';
                    contactForm.style.opacity = '1';
                }
            },
        },
    ].map((threshold, ix) => {
        return {
            ...threshold,
            scrollPos: ix * 12,
        }
    });
    const sectionBarDivs: HTMLDivElement[] = Array.from(document.querySelectorAll('.bar'));

    // controls = new OrbitControls(camera, renderer.domElement);

    // controls.update();

    window.setThreshold = (thresholdIX: number) => {
        console.log('setting threshold, thresholdIX:', thresholdIX);
        console.log('setting threshold, current scrollAmount:', scrollAmount);

        scrollAmount = (thresholds[thresholdIX - 1]?.threshold ?? -1) + 1;

        console.log('set threshold, new scrollAmount:', scrollAmount);
    };

    window.addEventListener('wheel', ev => {
        if (!hasScrolled) {
            hasScrolled = true;
            // SCROLL_SIZE = ev.deltaY;
            // SCROLL_AMOUNT_MAX = SCROLL_SIZE * 1;

            // console.log('SIZE:MAX:', SCROLL_SIZE, SCROLL_AMOUNT_MAX);
        }

        // scrollAmount += ev.deltaY / SCROLL_SIZE;
        scrollAmount += (1 * Math.sign(ev.deltaY)) / SCROLL_SIZE;

        if (scrollAmount < 0) {
            scrollAmount = 0;
        } else if (scrollAmount >= SCROLL_AMOUNT_MAX) {
            scrollAmount = SCROLL_AMOUNT_MAX;
        }
    });

    window.addEventListener('scroll', () => {
        console.log('scrolling!');
    });

    let touchStarted = false;

    window.ontouchmove = ev => {
        // ev.touches.item(0)!.
    };

    // Post Processing
    const composer = new EffectComposer(renderer);

    window.addEventListener('resize', onWindowResize);

    function onWindowResize() {

        const aspectRatio = window.innerWidth / window.innerHeight;
        const width = isChromeBook ? 800 : window.innerWidth;
        const height = isChromeBook ? width * aspectRatio : window.innerHeight;
        camera.aspect = aspectRatio;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        composer.setSize(width, height);

        const domEle = renderer.domElement;
        if (isChromeBook) {
            domEle.style.width = window.innerWidth + 'px';
            domEle.style.height = window.innerHeight + 'px';
        }
    };

    onWindowResize();

    let oldCurrentThreshold: any;

    function animate() {
        // stats.begin();

        const now = performance.now();
        const DT = now - last;
        const DT_RATIO = DT / 1000;
        last = now;

        if (DT_RATIO > 1) {
            return;
        }

        const kigPosUpt = kigaMesh.position;

        kigPosUpt
            .setX(lerp(kigPos.x, kigPos.x + logoOffset.x, DT_RATIO))
            .setY(lerp(kigPos.y, kigPos.y + logoOffset.y, DT_RATIO));

        totalBarAmount = lerp(totalBarAmount, scrollAmount, DT_RATIO * 3.4);
        camera.position.z = lerp(camera.position.z, START_CAM_POS_Z + scrollPos, DT_RATIO * 3.4);
        light1.position.z = lerp(light1.position.z, START_BOX_LIGHTS_POS_Z + scrollPos, DT_RATIO * 3.4);

        let currentThreshold;
        let foundThreshold = false;

        for (let ix = 0, length = thresholds.length; ix < length; ix++) {
            const threshold = thresholds[ix];

            // How much the bar should be filled
            let barAmount = 0;

            if (totalBarAmount >= threshold.threshold) {
                barAmount = 1;
            } else if (thresholds[ix - 1]?.threshold >= totalBarAmount) {
                barAmount = 0;
            } else {
                const prevThreshold = thresholds[ix - 1]?.threshold ?? 0;

                const diff = totalBarAmount - prevThreshold;
                const thresholdSectionTotalAmount = threshold.threshold - prevThreshold;

                barAmount = diff / thresholdSectionTotalAmount;
            }

            const sectionBar = sectionBarDivs[ix];

            if (sectionBar) {
                sectionBar.style.height = `${barAmount * 100}%`;
            }

            // Whether this is the threshold we are looking for
            if (!foundThreshold && totalBarAmount <= threshold.threshold) {
                currentThreshold = threshold;
                foundThreshold = true;
            }
        }

        if (currentThreshold && currentThreshold !== oldCurrentThreshold) {
            scrollPos = currentThreshold.scrollPos;
            currentThreshold?.callback?.();

            oldCurrentThreshold = currentThreshold;
        }

        TWEEN.update();

        renderer.render(scene, camera);
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
            composer.dispose();
        }
    }
}

export default StartGame;
