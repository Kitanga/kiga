import { game_over, set_game_over } from "../../../App";
import { AudioController } from "../../Controllers/AudioController";
import { cycleBanner } from "./cycleBanner";

export const gameOverMidgameAdfinished = async (oldMuted: boolean) => {
    console.log('ad finished');

    if (oldMuted) {
        AudioController.getInstance().mute();
    } else {
        AudioController.getInstance().unmute();
    }

    set_game_over(true);
    AudioController.getInstance().playGameOverMusic();
    AudioController.getInstance().playGetBack();

    const respawnBtn = document.getElementById('respawn-btn');

    if (respawnBtn) {
        respawnBtn.classList.add('disabled');
        respawnBtn.innerHTML = 'PREPPING SHIP';
    }

    setTimeout(() => {
        if (respawnBtn) {
            respawnBtn.classList.remove('disabled');
            respawnBtn.innerHTML = 'RESPAWN';
        }
    }, 2000);

    // setTimeout(async () => {
    //#region request banner ad
    // try {
    //     await cycleBanner('game-over-banner', () => game_over());
    // } catch (err) {
    //     console.error(err);
    // }

    if (respawnBtn) {
        respawnBtn.classList.remove('disabled');
        respawnBtn.innerHTML = 'RESPAWN';
    }
    // }, 2000);
}