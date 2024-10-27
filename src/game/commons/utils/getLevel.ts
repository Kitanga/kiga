import { EXP_MAX_PER_LEVEL, LEVEL_UP_REQ } from "../../constants"

export const getLevel = (xp: number) => {
    let newLevel = EXP_MAX_PER_LEVEL.findIndex(amount => {
        return amount > xp;
    });

    if (newLevel < 0) {
        newLevel = LEVEL_UP_REQ.length + 1;
    }
    
    return newLevel;
}