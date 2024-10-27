import { game_over } from "../../../App";
import { CrazyGamesController } from "../vendors/CrazyGamesController";

export const cycleBanner = async (
    id: 'game-over-banner' | 'menu-banner',
    predicate = () => true,
    waitTime = 62000
) => {
    if (CrazyGamesController.getInstance()?.sdk && predicate() && !CrazyGamesController.getInstance().gameplayInProgress) {
        console.warn('Reshowing ad:', game_over(), predicate());

        setTimeout(() => {
            cycleBanner(id, predicate, waitTime);
        }, waitTime);

        return new Promise<void>(async (res, rej) => {
            if (CrazyGamesController.getInstance().canCycleBannerDuringThisRound) {
                try {
                    await CrazyGamesController.getInstance().requestResponsiveBannerAd(id)
                    res();
                } catch(err) {
                    console.error(err);
                    rej(err);
                }
            } else {
                res();
            }
        });
    }
}