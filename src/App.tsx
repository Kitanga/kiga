import { JSX, createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { AnalyticsController } from './game/Controllers/AnalyticsController';
import { AudioController } from './game/Controllers/AudioController';
import { LocalStorageController } from './game/Controllers/LocalStorageController';
import { ITransformPayload, NetController } from './game/Controllers/NetController';
import { Notif, NotificationType } from './game/Controllers/NotifierController';
import { SBGame } from './game/SBGame';
import { SBGameMenu } from './game/SBGameMenu';
import { SBGameLogo } from './game/commons/branding/SBGameLogo';
import { Arrows2SVG } from './game/commons/components/Arrows2SVG';
import { ArrowsSVG } from './game/commons/components/ArrowsSVG';
import { Banner300x250 } from './game/commons/components/Banner300x250';
import { ChatMessage } from './game/commons/components/ChatMessage';
import { CustomizationItem } from './game/commons/components/CustomizationItem';
import { CustomizationModalInner } from './game/commons/components/CustomizationModalInner';
import { Modal } from './game/commons/components/Modal';
import { PlayerAttributes } from './game/commons/components/PlayerAttributes';
import { SectionHeader } from './game/commons/components/SectionHeader';
import mainMenuStyles from './game/commons/css/MainMenu.module.css';
import MapStyles from './game/commons/css/Map.module.css';
import { SAIL_NAMES, SAILS_CUSTOMIZATIONS } from './game/commons/customizations/sails';
import { LocalStorageKeys } from './game/commons/enums/LocalStorageKeys';
import { EditIconSvg } from './game/commons/icons/EditIconSVG';
import { InfoIconSvg } from './game/commons/icons/InfoIconSvg';
import { auxClickResetInputs } from './game/commons/utils/auxClickResetInputs';
import { getResourceLink } from './game/commons/utils/getResourceLink';
import { CrazyGamesController, InviteLinkParams } from './game/commons/vendors/CrazyGamesController';
import { BASE_PROJECTS_URL, CAMERA_POS, EXP_NEEDED_TO_LEVEL_UP, GAME_SIZE, MAP_SPECIAL_INDICATOR } from './game/constants';
import { PokiController } from './game/commons/vendors/PokiController';

export enum PageNames {
    HOME = 'home',
    PLAY = 'play',
}
export enum GameState {
    LOADING,
    READY,
}

export interface IOpponent extends ITransformPayload {
    id: string;
    score: number;
    name: string;
    specialty?: MAP_SPECIAL_INDICATOR
}

export interface IUpgradeBonus {
    type: MAP_SPECIAL_INDICATOR,
    ratio: number;
}

export const [pos, set_pos] = createSignal({
    x: 0,
    y: 0,
});
export const [focused, set_focused] = createSignal(true);
export const [mute, set_mute] = createSignal(false);
export const [ping, set_ping] = createSignal(0);
export const [invite_link, set_invite_link] = createSignal('');
export const [show_ping, set_show_ping] = createSignal(false);
export const [show_help, set_show_help] = createSignal(false);
export const [show_loader, set_show_loader] = createSignal(false);
export const [show_tutorial, set_show_tutorial] = createSignal(false);
export const [should_start_game, set_should_start_game] = createSignal(false);
export const [disconnected, set_disconnected] = createSignal(false);
export const [show_new_level_celebration, set_show_new_level_celebration] = createSignal(false);
export const [video_ad_playing, set_video_ad_playing] = createSignal(false);

export const [opponents, set_opponents] = createSignal<{ [key: string]: IOpponent }>({});
export const opponents_repo: any = {};
// setInterval(() => {
//     set_opponents(opponents_repo);
// }, 1000);
export const [crates, set_crates] = createSignal<{ [key: string]: IOpponent }>({});
export const [upgrades, set_upgrades] = createSignal<IUpgradeBonus[]>([]);

// export const [current_page, set_current_page] = createSignal<PageNames>(new URLSearchParams(location.search).has(InviteLinkParams.INSTANT_JOIN) && JSON.parse(new URLSearchParams(location.search).get(InviteLinkParams.INSTANT_JOIN) || 'false') ? PageNames.PLAY : PageNames.HOME);
export const [current_page, set_current_page] = createSignal<PageNames>(PageNames.PLAY);
export const [username, set_username] = createSignal('GUEST');
export const [user_level, set_user_level] = createSignal(1);
export const [user_xp, set_user_xp] = createSignal(1);
export const [player_near_boss, set_player_near_boss] = createSignal(false);
export const [boss_id, set_boss_id] = createSignal<string | undefined>();
export const [boss_health, set_boss_health] = createSignal(0);

export const [health_attr, set_health_attr] = createSignal(0);
export const [damage_attr, set_damage_attr] = createSignal(0);
export const [speed_attr, set_speed_attr] = createSignal(0);
export const [turn_speed_attr, set_turn_speed_attr] = createSignal(0);
export const [range_attr, set_range_attr] = createSignal(0);
export const [reload_time_attr, set_reload_time_attr] = createSignal(0);
export const [user_score, set_user_score] = createSignal(0);

export const [chat, set_chat] = createSignal<{ user: string, content: string, important?: boolean }[]>([]);
export const [using_chat, set_using_chat] = createSignal(false);
export const [game_over, set_game_over] = createSignal(false);
export const [show_sail_customs, set_show_sail_customs] = createSignal(false);
// export const [blur_sail_customs_bg, set_blur_sail_customs_bg] = createSignal(false);
export const [notifs, set_notifs] = createSignal<Map<string, Notif>>(new Map());

export const [selected_sail, set_selected_sail] = createSignal<string | undefined>(SAIL_NAMES.NONE);
export const [temporary_selected_sail, set_temporary_selected_sail] = createSignal<string | undefined>(selected_sail());
export const [time_temporary_selected_sail, set_time_temporary_selected_sail] = createSignal(performance.now());

export const [is_mobile, set_is_mobile] = createSignal((window as any).MOBILE_DEVICE);

const App = () => {
    window.addEventListener('resize', () => {
        const bodyStyle = getComputedStyle(document.documentElement);

        (window as any).MOBILE_DEVICE = !!bodyStyle.getPropertyValue('--is-mobile');

        set_is_mobile((window as any).MOBILE_DEVICE);
    });

    const SIZE = 9;
    const MAP_SIZE = 142;
    const HALF_MAP_SIZE = MAP_SIZE * 0.5;

    set_mute(JSON.parse(LocalStorageController.getItem(LocalStorageKeys.MUTED) || 'false'));
    set_username(LocalStorageController.getItem(LocalStorageKeys.USERNAME) || 'GUEST');
    set_selected_sail(LocalStorageController.getItem(LocalStorageKeys.SAILS) || SAIL_NAMES.NONE);

    createEffect(() => {
        if (game_over()) {
            AnalyticsController.getInstance().logScreenView('game_over');
        }
    });
    createEffect(() => {
        if (show_tutorial()) {
            AnalyticsController.getInstance().logScreenView('tutorial');
        }
    });
    createEffect(() => {
        LocalStorageController.setItem(LocalStorageKeys.MUTED, mute().toString());
    });
    createEffect(() => {
        AnalyticsController.getInstance().logScreenView(current_page());

        if (current_page() == PageNames.HOME) {
            CrazyGamesController.getInstance().hideInviteButton();
        }
    });

    onMount(() => {
        console.log('app mount');

        document.onvisibilitychange = () => {
            if (document.hidden) {
                set_focused(false);
                console.log('focus:', false);
            } else {
                set_focused(true);
                console.log('focus:', true);
            }
        };

        onCleanup(() => {
            console.log('app clean up');
        })
    });

    return (
        <div id="app">
            {
                current_page() == PageNames.PLAY && (<>
                    <SBGame />

                    {/* Game Over modal */}
                    {game_over() && <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,

                            width: '100vw',
                            height: '100vh',

                            display: 'flex',
                            "align-items": 'center',
                            "justify-content": 'center',
                            "flex-direction": 'column',

                            "z-index": 9999,
                        }}
                        id='game-over'
                    >
                        {/* Closer */}
                        <div
                            style={{
                                background: '#00000070',
                                "backdrop-filter": 'grayscale(0.34)',
                                width: '100%',
                                height: '100%',
                                cursor: 'pointer',
                            }}
                            onClick={() => {
                                const respawnBtn = document.getElementById('respawn-btn');

                                if (respawnBtn && !respawnBtn.classList.contains('disabled')) {
                                    respawnBtn.click();
                                }

                                console.log('game over closer clicked');
                            }}
                        ></div>
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            display: 'flex',
                            "align-items": 'center',
                            "justify-content": 'center',
                            "flex-direction": 'column',
                            width: '100%',
                            height: '100%',
                            "pointer-events": 'none',
                        }}>
                            <div
                                style={{
                                    "pointer-events": 'all',
                                }}
                            >
                                {/* <div style={{
                                    color: 'white',
                                    width: '100%',
                                    "text-align": 'right',
                                    cursor: 'pointer',
                                }}>x</div> */}
                                <div
                                    style={{
                                        display: 'grid',
                                        // "grid-template": '5fr 2fr',
                                        gap: '8px',
                                        "box-sizing": 'border-box',
                                        padding: '0px 8px'
                                    }}
                                    id="game-over-inner"
                                >
                                    <div style={{
                                        padding: '3.4vh 10vw',
                                        // "aspect-ratio": '1',
                                        background: 'var(--white)',
                                        color: 'var(--black)',
                                        "text-align": 'center',
                                    }}>
                                        <h2 style={{
                                            "margin-top": '0px',
                                        }}>You died. Go. Again! 🫡</h2>

                                        <div style={{
                                            display: 'grid',
                                            "grid-template-rows": '1fr 1fr',
                                            gap: '8px',
                                        }}>
                                            <div
                                                // You find the class definition in index.html, sorry in advance
                                                class="respawn-btn"
                                                id="respawn-btn"
                                                onClick={() => {

                                                }}
                                                style={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    "justify-content": 'center',
                                                    "align-items": 'center',
                                                }}
                                            >
                                                RESPAWN
                                            </div>
                                            <div style={{
                                                display: 'grid',
                                                "grid-template-columns": '1fr 1fr',
                                                gap: '8px',
                                            }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        "justify-content": 'center',
                                                        "align-items": 'center',
                                                        width: '100%',
                                                        height: '100%',
                                                        "box-sizing": 'border-box',
                                                        background: 'var(--black)',
                                                    }}
                                                    class="respawn-home-btn"
                                                    onClick={() => {
                                                        // set_game_over(false);
                                                        // CrazyGamesController.getInstance().clearAllBannerAds();
                                                        // AudioController.getInstance().stopGameOverMusic();
                                                        // const div = document.getElementById('game-over');
                                                        // if (div) {
                                                        //     div.style.opacity = '1';
                                                        // }
                                                        // set_current_page(PageNames.HOME);
                                                    }}
                                                >
                                                    <input
                                                        type="text"
                                                        id="username"
                                                        value={username()}
                                                        onchange={(ev) => {
                                                            LocalStorageController.setItem(LocalStorageKeys.USERNAME, ev.target.value || 'GUEST');
                                                            set_username(ev.target.value || 'GUEST');
                                                        }}
                                                        onblur={_ => {
                                                            if (username() == '') {
                                                                console.log('blank')
                                                            } else {
                                                                console.log('full:', username())
                                                            }
                                                        }}
                                                        placeholder="Input your username"
                                                        class={[mainMenuStyles.input, ''].join(' ')}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                        }}
                                                    />
                                                    <EditIconSvg />
                                                </div>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        "justify-content": 'center',
                                                        "align-items": 'center',
                                                        width: '100%',
                                                        height: '100%',
                                                        "box-sizing": 'border-box',
                                                    }}
                                                    class="respawn-home-btn"
                                                    onClick={() => {
                                                        // !blur_sail_customs_bg() && set_blur_sail_customs_bg(true);
                                                        set_show_sail_customs(true);
                                                    }}
                                                >Edit Sails</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        "min-width": '0',
                                        "min-height": '0',
                                        background: 'var(--black)',
                                        color: 'var(--white)',
                                        display: 'flex',
                                        "justify-content": 'center',
                                        "align-items": 'center',
                                        // padding: '0 12px',
                                        "box-sizing": 'border-box',
                                        "flex-direction": 'column',
                                        gap: '8px',
                                    }}
                                        id="game-over-invite-link">
                                        <div style={{
                                            "text-align": 'center',
                                            "font-weight": '700',
                                        }}>
                                            You know, you'll die less if you bring friends
                                        </div>
                                        <div
                                            style={{
                                                padding: '3px 7px',
                                                ...(
                                                    invite_link() ? {
                                                        "border-bottom": '1px solid var(---white)',
                                                        color: 'var(white)',
                                                    } : {
                                                        background: 'var(--white)',
                                                        color: 'var(--black)'
                                                    }
                                                ),
                                                "border-radius": '50px',
                                                "font-weight": 700,
                                                cursor: 'pointer',
                                            }}
                                            onclick={async () => {
                                                if (invite_link()) {
                                                } else {
                                                    // const inviteURL = CrazyGamesController.getInstance().getInviteLink();
                                                    const inviteURL = await PokiController.getInstance().getInviteLink();

                                                    if (inviteURL) {
                                                        set_invite_link(inviteURL);
                                                        navigator.clipboard.writeText(inviteURL);
                                                    }
                                                }
                                            }}
                                        >
                                            {
                                                // invite_link() && CrazyGamesController.getInstance().sdk ?
                                                invite_link() && PokiController.getInstance().sdk ?
                                                    <div style={{
                                                        "text-align": 'center',
                                                    }}>
                                                        <input
                                                            type='text'
                                                            value={invite_link()}
                                                            style={{
                                                                background: 'white',
                                                                "user-select": 'all',
                                                                color: 'var(--black)',
                                                                "border-left": 'none',
                                                                "border-right": 'none',
                                                                "border-top": 'none',
                                                                "border-bottom": '1px solid var(--white)',
                                                                outline: 'none',
                                                            }}
                                                            readOnly
                                                            onClick={function () {
                                                                this.select();
                                                            } as (this: HTMLInputElement) => {}}
                                                            id="invite-link"
                                                        />
                                                        <br />
                                                        <label for="invite-link" style={{
                                                            color: 'var(--white)',
                                                            "font-size": '12px',
                                                        }}>Link Copied!</label>
                                                    </div> :
                                                    'Copy Your Lobby Link'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <div style={{
                                display: 'flex',
                                "justify-content": 'center',
                                "align-items": 'center',
                                "margin-top": '4px',
                                "pointer-events": 'all',
                            }}>
                                <div
                                    style={{
                                        width: '300px',
                                        height: '250px',
                                    }}
                                    id="game-over-banner"
                                ></div>
                            </div> */}
                        </div>
                    </div>}
                </>)
            }
        </div >
    );
};

export default App;
