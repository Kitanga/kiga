import { Texture } from "three";

export const texture_repo: { [key in TEXTURE_NAMES as string]: Texture} = {}

export enum TEXTURE_NAMES {
    CROSS = 'CROSS_RED',
    FOAM = 'FOAM',
    WATER_NORMAL = "WATER_NORMAL",
    WATER_NORMAL_1 = "WATER_NORMAL_1",
    WATER_NORMAL_2 = "WATER_NORMAL_2",
    FLOW_MAP = "FLOW_MAP",
    SPLASH_PADDLE = "SPLASH_PADDLE",
    SPLASH = "SPLASH",
    CRAZY_GAMES_WHITE = 'CRAZY_GAMES_WHITE',
    // KIGA_BLACK = 'KIGA_BLACK',
    CRAZY_GAMES_BLACK = 'CRAZY_GAMES_BLACK',
    CRAZY_GAMES_PURPLE = "CRAZY_GAMES_PURPLE",
    ZAMBIA = "ZAMBIA",
    BELGIUM = "BELGIUM",
    GERMANY = "GERMANY",
    USA = "USA",
    SA = "SA",
}
