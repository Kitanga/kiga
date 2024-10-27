import { JSXElement } from "solid-js";
import { MeshStandardMaterial } from "three";
import { TEXTURE_NAMES } from "../../texture_repo";

export enum SAIL_NAMES {
    // Solid colours
    GREY = 'GREY',
    RED = 'Red',
    ORANGE = 'Orange',
    YELLOW = 'Yellow',
    GREEN = 'Green',
    BLUE = 'Blue',
    INDIGO = 'Indigo',
    VIOLET = 'Violet',

    // Textures
    // Crazy Games
    CRAZY_GAMES_PURPLE = "Crazy Games",
    CRAZY_GAMES_WHITE = 'Crazy Games (White)',
    CRAZY_GAMES_BLACK = 'Crazy Games (Black)',
    // 
    CROSS = "CROSS",
    // KIGA_BLACK = "KIGA_BLACK",

    // Flags
    ZAMBIA = "ZAMBIA",
    BELGIUM = "BELGIUM",

    NONE = "NONE",
    GERMANY = "GERMANY",
    USA = "USA",
    SA = "SA",
    BLACK = "BLACK",
}

export const SAILS_COLORS = [
    [SAIL_NAMES.GREY, '#707070'],
    [SAIL_NAMES.ORANGE, '#fd9b39'],
    [SAIL_NAMES.YELLOW, '#ffff28'],
    [SAIL_NAMES.GREEN, '#34fd34'],
    [SAIL_NAMES.BLUE, '#5656ff'],
    [SAIL_NAMES.RED, '#e34242', true],
    [SAIL_NAMES.VIOLET, '#9400d3', true],
    [SAIL_NAMES.INDIGO, '#561487', true],
    [SAIL_NAMES.BLACK, '#141414', false],
] as const;

export interface ISailItem {
    name: SAIL_NAMES;
    icon: JSXElement;
    value?: string;
    key?: TEXTURE_NAMES;
    requiresAd?: boolean;
    unlocked?: boolean;
}

export const SAILS_CUSTOMIZATIONS: ISailItem[] = [
    {
        name: SAIL_NAMES.NONE,
        icon: <div style={{ background: '#EAE1D6', width: '100%', height: '100%' }}>
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                "justify-content": 'center',
                "align-items": 'center'
            }}>
                <svg style={{
                    width: '50%',
                    height: 'auto',
                }} width="52" height="51" viewBox="0 0 52 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.898259 8.88299L9.38354 0.39771L51.1028 42.117L42.6176 50.6023L0.898259 8.88299Z" fill="var(--grey)" />
                    <path d="M9.38354 50.6023L0.898259 42.117L42.6176 0.39771L51.1028 8.88299L9.38354 50.6023Z" fill="var(--grey)" />
                </svg>
            </div>
        </div>,
        value: '#EAE1D6',
        unlocked: true,
    },
    ...SAILS_COLORS.map(([sailName, color, unlocked]) => {
        return {
            name: sailName,
            icon: <div style={{
                background: color,
                width: '100%',
                height: '100%'
            }}></div>,
            value: color,
            unlocked: unlocked ?? true,
        } as any;
    }),
    ...((window as any).IS_CRAZY_GAMES ? [
        {
            name: SAIL_NAMES.CRAZY_GAMES_WHITE,
            key: TEXTURE_NAMES.CRAZY_GAMES_WHITE,
            icon: <div style={{ width: '100%', height: '100%' }}>
                <img style={{
                    width: '100%',
                    height: 'auto',
                }} src={`./assets/img/icon-sails-${TEXTURE_NAMES.CRAZY_GAMES_WHITE}.png`} alt="An icon for a sails customization in the game Sunbaked" />
            </div>,
            unlocked: true
        },
        {
            name: SAIL_NAMES.CRAZY_GAMES_BLACK,
            key: TEXTURE_NAMES.CRAZY_GAMES_BLACK,
            icon: <div style={{ width: '100%', height: '100%' }}>
                <img style={{
                    width: '100%',
                    height: 'auto',
                    filter: 'invert(1)',
                }} src={`./assets/img/icon-sails-${TEXTURE_NAMES.CRAZY_GAMES_WHITE}.png`} alt="An icon for a sails customization in the game Sunbaked" />
            </div>,
        },
        {
            name: SAIL_NAMES.CRAZY_GAMES_PURPLE,
            key: TEXTURE_NAMES.CRAZY_GAMES_PURPLE,
            icon: <div style={{ width: '100%', height: '100%' }}>
                <img style={{
                    width: '100%',
                    height: 'auto',
                }} src={`./assets/img/icon-sails-${TEXTURE_NAMES.CRAZY_GAMES_PURPLE}.png`} alt="An icon for a sails customization in the game Sunbaked" />
            </div>,
            unlocked: true
        },
    ] : []),
    {
        name: SAIL_NAMES.CROSS,
        key: TEXTURE_NAMES.CROSS,
        icon: <div style={{ width: '100%', height: '100%' }}>
            <img style={{
                width: '100%',
                height: 'auto',
            }} src={`./assets/img/icon-sails-${TEXTURE_NAMES.CROSS}.png`} alt="An icon for a sails customization in the game Sunbaked" />
        </div>,
    },
    {
        name: SAIL_NAMES.ZAMBIA,
        key: TEXTURE_NAMES.ZAMBIA,
        icon: <div style={{ width: '100%', height: '100%' }}>
            <img style={{
                width: '100%',
                height: 'auto',
            }} src={`./assets/img/icon-sails-${TEXTURE_NAMES.ZAMBIA}.png`} alt="An icon for a sails customization in the game Sunbaked" />
        </div>,
    },
    {
        name: SAIL_NAMES.BELGIUM,
        key: TEXTURE_NAMES.BELGIUM,
        icon: <div style={{ width: '100%', height: '100%' }}>
            <img style={{
                width: '100%',
                height: 'auto',
            }} src={`./assets/img/icon-sails-${TEXTURE_NAMES.BELGIUM}.png`} alt="An icon for a sails customization in the game Sunbaked" />
        </div>,
    },
    {
        name: SAIL_NAMES.GERMANY,
        key: TEXTURE_NAMES.GERMANY,
        icon: <div style={{ width: '100%', height: '100%' }}>
            <img style={{
                width: '100%',
                height: 'auto',
            }} src={`./assets/img/icon-sails-${TEXTURE_NAMES.GERMANY}.png`} alt="An icon for a sails customization in the game Sunbaked" />
        </div>,
    },
    {
        name: SAIL_NAMES.USA,
        key: TEXTURE_NAMES.USA,
        icon: <div style={{ width: '100%', height: '100%' }}>
            <img style={{
                width: '100%',
                height: 'auto',
            }} src={`./assets/img/icon-sails-${TEXTURE_NAMES.USA}.png`} alt="An icon for a sails customization in the game Sunbaked" />
        </div>,
    },
    // {
    //     name: SAIL_NAMES.KIGA_BLACK,
    //     key: TEXTURE_NAMES.KIGA_BLACK,
    //     icon: <div style={{ width: '100%', height: '100%' }}>
    //         <img style={{
    //             width: '100%',
    //             height: 'auto',
    //         }} src={`assets/img/icon-sails-${TEXTURE_NAMES.USA}.png`} alt="An icon for a sails customization in the game Sunbaked" />
    //     </div>,
    // },
    {
        name: SAIL_NAMES.SA,
        key: TEXTURE_NAMES.SA,
        icon: <div style={{ width: '100%', height: '100%' }}>
            <img style={{
                width: '100%',
                height: 'auto',
            }} src={`./assets/img/icon-sails-${TEXTURE_NAMES.SA}.png`} alt="An icon for a sails customization in the game Sunbaked" />
        </div>,
    },
].sort((a: ISailItem, b: ISailItem) => (b.unlocked ? 1 : 0) - (a.unlocked ? 1 : 0));

export const sail_mat_repo: { [key in SAIL_NAMES]: MeshStandardMaterial } = {} as any;
