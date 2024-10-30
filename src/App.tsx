import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { AnalyticsController } from './game/Controllers/AnalyticsController';
import { LocalStorageController } from './game/Controllers/LocalStorageController';
import { ITransformPayload } from './game/Controllers/NetController';
import { Notif } from './game/Controllers/NotifierController';
import { SBGame } from './game/SBGame';
import { SAIL_NAMES } from './game/commons/customizations/sails';
import { LocalStorageKeys } from './game/commons/enums/LocalStorageKeys';
import { CrazyGamesController } from './game/commons/vendors/CrazyGamesController';
import { MAP_SPECIAL_INDICATOR } from './game/constants';

export enum PageNames {
    HOME = 'home',
    PLAY = 'play',
}
export enum GameState {
    LOADING,
    READY,
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

export const opponents_repo: any = {};
// setInterval(() => {
//     set_opponents(opponents_repo);
// }, 1000);
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
            <SBGame />

            {/* Navigation */}
            <nav style={{
                color: 'var(--white)',
                "text-shadow": '0 1px var(--black)',
                position: 'fixed',
                height: '20vh',
                "z-index": '1000',
                right: 0,
                "padding-right": '16px',
                "text-align": 'right',
                display: 'grid',
                "grid-template-rows": '0.05fr 0.4fr 0.7fr 0.3fr',
                gap: '4px',
            }}>
                {[
                    ['home', 'Home'],
                    ['who-we-are', 'Who we are'],
                    ['what-we-do', 'What we do'],
                    ['contact', 'Contact'],
                ].map(([id, label], ix) => {
                    return <div id={id} style={{
                        cursor: 'pointer',
                        display: 'flex',
                        "justify-content": 'space-between',
                        gap: '8px',
                    }}
                    onClick={() => {
                        window.setThreshold(ix);
                    }}>
                        <span>{label}</span>
                        <span>
                            <div style={{
                                width: '7px',
                                height: '100%',
                                background: 'var(--grey)',
                                "border-radius": '4px',
                                overflow: 'hidden',
                                "backdrop-filter": 'blur(4px)'
                            }}>
                                <div class="bar" style={{
                                    width: '100%',
                                    height: ix == 0 ? '14%' : '0%',
                                    background: 'var(--white)',
                                }}></div>
                            </div>
                        </span>
                    </div>
                })}
            </nav>

            {/* Contact Form */}
            <div
                style={{
                    color: 'white',
                    "font-weight": 900,
                    "transition-property": 'transform, opacity',
                    "transition-duration": '.7s',
                    "will-change": 'transform, opacity',
                    opacity: 0,
                    transform: 'translateY(10%)',
                    position: 'fixed',
                    width: '100%',
                    height: '100%',
                    "font-size": '95px',
                    display: 'flex',
                    "align-items": 'center',
                    "justify-content": 'center',
                }}
                id="contact-form"
            >
                A contact form
            </div>
        </div>
    );
};

export default App;
