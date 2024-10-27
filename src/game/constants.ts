import { Color, MeshStandardMaterial, Vector3 } from "three";

export const SERVER_UPDATE_TICK = 1000 / 30;
// export const GAME_SIZE = 680 * 0.75;
// export const GAME_SIZE = 100;
export const GAME_SIZE = 110;
export const BUCKETS_X = 9;
export const BUCKETS_Y = 9;
export const BUCKET_WIDTH = GAME_SIZE / BUCKETS_X;
export const BUCKET_HEIGHT = GAME_SIZE / BUCKETS_Y;

export const MISSILE_LENGTH = 2;
export const MISSILE_TIP_RADIUS = 0.25;

export const HALF_GAME_SIZE = GAME_SIZE * 0.5;
export const CAMERA_POS = new Vector3(0, 7, 3);
export const MIN_POS = new Vector3(-HALF_GAME_SIZE, CAMERA_POS.y, -HALF_GAME_SIZE);
export const MAX_POS = new Vector3(HALF_GAME_SIZE - 1, CAMERA_POS.y, HALF_GAME_SIZE - 1);
export const CAMERA_MIN_POS = new Vector3(-HALF_GAME_SIZE, 0, -HALF_GAME_SIZE).add(CAMERA_POS);
export const CAMERA_MAX_POS = new Vector3(HALF_GAME_SIZE, 0, HALF_GAME_SIZE).add(CAMERA_POS);
export const TIMEOUT_TIME = 30 * 1000;

export const BASE_RESOURCE_URL = location.href.includes('localhost') ? 'http://localhost:5501' : 'https://kitanga.github.io/sunbaked-resources.kitanga.dev';
export const BASE_PROJECTS_URL = `${BASE_RESOURCE_URL}`;

export enum SERVER_OPTION_NAMES {
    // DE_FALKENSTEIN = 'DE-Falkenstein',
    DE_NUREMBERG = 'DE-Nuremberg',
    US_EAST = 'US-EAST',
    ZA_JOBURG = 'ZA-Joburg',
    JHB = 'jhb',
    LOCALHOST = 'localhost',
}

export interface IServerOption {
    name: SERVER_OPTION_NAMES;
    url: string;
    hidden?: boolean;
}

export const SERVER_OPTIONS = new Map<SERVER_OPTION_NAMES, IServerOption>([
    // {
    //     name: 'US-OHIO',
    //     url: 'wss://sunbacked-server.onrender.com/ws'
    // },
    // {
    //     name: SERVER_OPTION_NAMES.DE_FALKENSTEIN,
    //     url: 'sunbakedserver.kitanga.dev',
    // },
    {
        name: SERVER_OPTION_NAMES.DE_NUREMBERG,
        url: 'sunbakedserver2.kitanga.dev',
    },
    {
        name: SERVER_OPTION_NAMES.US_EAST,
        url: 'sunbakedserver-us-east.kitanga.dev',
    },
    // {
    //     name: SERVER_OPTION_NAMES.US_2,
    //     url: 'sunbakedserver-us-2.kitanga.dev',
    // },
    // {
    //     name: SERVER_OPTION_NAMES.EU_2,
    //     url: 'sunbakedserver-eu-2.kitanga.dev',
    // },
    {
        name: SERVER_OPTION_NAMES.ZA_JOBURG,
        url: 'sunbacked-server.fly.dev',
    },
    {
        name: SERVER_OPTION_NAMES.LOCALHOST,
        url: 'localhost:3000',
        hidden: true,
    },
    {
        name: SERVER_OPTION_NAMES.JHB,
        url: 'sunbacked-server.fly.dev',
        hidden: true,
    },
].map(server => ([server.name, server])));

// TODO: use this for when you need to figure out which of the two regions to join
export const DEFAULT_SERVER_OPTIONS_SEARCH = [
    SERVER_OPTION_NAMES.US_EAST,
    SERVER_OPTION_NAMES.DE_NUREMBERG,
];

export const SAIL_MAT_NAME = 'Sail';
export const SAILS_DEFAULT_COLOR = new Color(0.8196078538894653, 0.7529411911964417, 0.6705882549285889);
export const SAILS_DEFAULT_MAT = new MeshStandardMaterial({
    color: SAILS_DEFAULT_COLOR,
})

export enum ATTRIBUTES {
    HEALTH,
    DAMAGE,
    SPEED,
    TURN_SPEED,
    RANGE,
    RELOAD_TIME,
}

export enum ATTRIBUTE_DEFAULTS {
    HEALTH = 100,
    DAMAGE = 14,
    SPEED = 7,
    TURN_SPEED = 1.2,
    RANGE = 21,
    RELOAD_TIME = 2500,
}

export enum ATTRIBUTES_NAME {
    HEALTH = 'health',
    DAMAGE = 'damage',
    SPEED = 'speed',
    TURN_SPEED = 'turn speed',
    RANGE = 'range',
    RELOAD_TIME = 'reload time',
}

export const EXP_GAIN_CRATE = 50;
export const EXP_GAIN_ELIMINATION = EXP_GAIN_CRATE * 3;
export const EXP_GAIN_UPGRADE_CRATE = EXP_GAIN_CRATE * 2;

export const LEVEL_UP_REQ = [1, 2, 3, 5, 8, 13, 21];
// export const STAT_UPGRADES_PER_LEVEL = [5, 6, 6, 5, 4, 6, 10];
export const EXP_NEEDED_TO_LEVEL_UP = [
    LEVEL_UP_REQ[0] * EXP_GAIN_CRATE,
    LEVEL_UP_REQ[1] * EXP_GAIN_CRATE,
    LEVEL_UP_REQ[2] * EXP_GAIN_CRATE,
    LEVEL_UP_REQ[3] * EXP_GAIN_CRATE,
    LEVEL_UP_REQ[4] * EXP_GAIN_CRATE,
    LEVEL_UP_REQ[5] * EXP_GAIN_CRATE,
    LEVEL_UP_REQ[6] * EXP_GAIN_CRATE,
];

export const EXP_MAX_PER_LEVEL = new Array(LEVEL_UP_REQ.length).fill(1).map((_, ix) => {
    return EXP_NEEDED_TO_LEVEL_UP.slice(0, ix).reduce((a, b) => a + b, 0);
});

export enum SpawnerTypes {
    TOP = 'TOP',
    SIDE = 'SIDE',
    BOTTOM = 'BOTTOM',
}

export enum WebVendors {
    CRAZY_GAMES = 'CRAZY_GAMES',
    POKI = 'POKI',
}

export enum MAP_SPECIAL_INDICATOR {
    HEALTH,
    DAMAGE,
    SPEED,
    TURN_SPEED,
    RANGE,
    RELOAD_TIME,
}

export const FiringPositions = [
    [
        [4,0.34,-0.011172412894666195],
    ],
    [
        [0.09011763334274292,0.34,-1.224287509918213],
        [1.7048373222351074,0.34,-1.224287509918213],
        [-1.6644327640533447,0.71,-1.3937300443649292],
        [-2.2702393531799316,0.71,-1.3937300443649292],
    ],
    [
        [1.6790320873260498,0.34,1.24186372756958],
        [0.08211290836334229,0.34,1.250414490699768],
        [-1.6644327640533447,0.71,1.4037777185440063],
        [-2.2702393531799316,0.71,1.4037777185440063],
    ],
    [
        [-3.4,1.6486656665802002,0.0004059466882608831],
    ]
] as const;

export const ISLAND_HEIGHT_VARIANTS = [
    0.2,
    0.1,
    0,
];

export const isChromeBook = (/\bCrOS\b/.test(navigator.userAgent));

export const AUTO_SHOOT_VARIANCE_BASE = ((25 / 360) * 0.5);
/** Check if opponent is ahead */
export const AUTO_SHOOT_VARIANCE_FORWARD = 1 - AUTO_SHOOT_VARIANCE_BASE;
/** Check if opponent is behind */
export const AUTO_SHOOT_VARIANCE_BEHIND = -1 + AUTO_SHOOT_VARIANCE_BASE;
/** Check if opponent is to the left or right (lower bound) */
export const AUTO_SHOOT_VARIANCE_PERPENDICULAR_LESSER = -AUTO_SHOOT_VARIANCE_BASE;
/** Check if opponent is to the left or right (upper bound) */
export const AUTO_SHOOT_VARIANCE_PERPENDICULAR_GREATER = AUTO_SHOOT_VARIANCE_BASE;