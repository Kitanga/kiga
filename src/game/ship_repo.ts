import { GLTF } from "three/examples/jsm/Addons.js";

export const mesh_repo: { [key in MESH_NAMES as string]: GLTF} = {};

export enum MESH_NAMES {
    BASIC_1 = 'BASIC_1',
    BASIC_1_SAILS_DEFAULT = 'default-sails.gltf',
    CRATE = "CRATE",
    ISLAND = "ISLAND",
    CRATE_PICKUP_TEXT = "CRATE_PICKUP_TEXT",
    CHEST_PICKUP_TEXT = "CHEST_PICKUP_TEXT",
    CTA_TEXT = "CTA_TEXT",
    CRAZY_GAMES = "CRAZY_GAMES",
    KIGA_GAMES = "KIGA_GAMES",
    SPONSOR_LOGO = "SPONSOR_LOGO",
    ARROW_GUIDES = "ARROW_GUIDES",
    POKI = "POKI",
    NEWGROUNDS = "NEWGROUNDS",
    FIRING_GUIDES = "FIRING_GUIDES",
    ITCHIO = "ITCHIO",
    GAMEJOLT = "GAMEJOLT",
    MISSILE = "MISSILE",
    BOX = "BOX",
}

export enum SHIP_SCALES {
    BASIC_1 = 0.14,
}
