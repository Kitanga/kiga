import { onCleanup, onMount } from 'solid-js';
import StartGame from './main';
import { disconnected, game_over, set_disconnected, set_game_over } from '../App';

export const SBGame = (props: any) => {

    let gameContainer: HTMLDivElement | undefined;

    onMount(() => {
        let game: ReturnType<typeof StartGame>

        try {
            game = StartGame('game-container');
        } catch (err) {
            console.error(err);
        }

        const preloader = document.getElementById('preloader');

        if (preloader) {
            preloader.style.display = 'none';
        }

        onCleanup(() => {
            set_disconnected(false);
            console.log('clean up');
            set_game_over(false);
            game?.cleanup?.();
        });
    });

    return (
        <div id="game-container" ref={gameContainer}></div>
    );
};