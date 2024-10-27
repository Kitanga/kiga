import { Easing, Tween } from "@tweenjs/tween.js";
import { set_show_new_level_celebration, set_user_level, user_level } from "../../../App";
import { getLevel } from "./getLevel";
import { AudioController } from "../../Controllers/AudioController";

export const animateNewLevel = (xp: number) => {
    const oldLevel = user_level();
    const newLevel = getLevel(xp);

    if (oldLevel !== newLevel && newLevel > oldLevel) {
        // Show animation celebration
        set_show_new_level_celebration(true);

        setTimeout(() => {
            const newLevelEle = document.getElementById('new-level');
            const shipsContainerEle = document.querySelector('.level-up-ships');

            if (newLevelEle && shipsContainerEle) {
                newLevelEle.style.opacity = '0';
                newLevelEle.style.transform = 'scale(3)';
                newLevelEle.innerHTML = newLevel.toString();

                const lShip = shipsContainerEle.children[0] as HTMLImageElement;
                const rShip = shipsContainerEle.children[1] as HTMLImageElement;

                AudioController.getInstance().playLevelUpShout();
                
                new Tween({ movement: 0 })
                    .to({
                        movement: 14,
                    })
                    .duration(2350)
                    .onUpdate(({ movement }) => {
                        lShip.style.transform = 'translateX(' + -movement + 'px)';
                        rShip.style.transform = 'translateX(' + movement + 'px)';
                    })
                    .start();

                new Tween({ opacity: 0 })
                    .to({
                        opacity: 1,
                    })
                    .delay(1000)
                    .duration(520)
                    .onUpdate(({ opacity }) => {
                        newLevelEle.style.opacity = opacity + '';
                    })
                    .start();

                const scale = { size: 3 };

                new Tween(scale)
                    .to({
                        size: 1,
                    })
                    .delay(1250)
                    .duration(700)
                    .easing(Easing.Elastic.Out)
                    .onUpdate(obj => {
                        newLevelEle.style.transform = 'scale(' + obj.size + ')';
                    })
                    .onComplete(() => {
                        setTimeout(() => {
                            set_show_new_level_celebration(false);
                        }, 1150);
                        setTimeout(() => {
                            lShip.style.transform = '';
                            rShip.style.transform = 'scaleX(-1)';

                            setTimeout(() => {
                                newLevelEle.style.opacity = '0';
                            }, 34);
                        }, 1400);
                    })
                    .start();
            }
        }, 34);

        set_user_level(newLevel);
        return true;
    }
    set_user_level(newLevel);

    return false;
}