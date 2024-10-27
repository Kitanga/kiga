import { HIGHEST_SHIP_STAND, LOWEST_SHIP_SINK } from "../../Templates/Player"

export const healthYOffset = (healthRatio: number) => {
    return (LOWEST_SHIP_SINK + -LOWEST_SHIP_SINK * healthRatio + HIGHEST_SHIP_STAND)
}
