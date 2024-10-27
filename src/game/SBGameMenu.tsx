import { onCleanup, onMount } from 'solid-js';
import { SBMainMenu } from '../scenes/SBMainMenu';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';

export const SBGameMenu = (props: any) => {

    let gameContainer: HTMLDivElement | undefined;

    onMount(() => {
        let menu: ReturnType<typeof SBMainMenu>

        try {
            menu = SBMainMenu('game-container');
        } catch (err) {
            console.error(err);
        }

        const preloader = document.getElementById('preloader');

        if (preloader) {
            preloader.style.display = 'none';
        }

        onCleanup(() => {
            console.log('main meny clean up');
            menu.scene.clear();
            menu.renderer.setAnimationLoop(null);
        });
    });

    return (
        <div id="game-container" ref={gameContainer}></div>
    );
};