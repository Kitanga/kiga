// Import the functions you need from the SDKs you need
import { is_mobile, PageNames } from "../../App";
import { SAIL_NAMES } from "../commons/customizations/sails";
import { getBucketIX, getBucketName } from "../commons/utils/getBucketKey";
import { SERVER_OPTION_NAMES } from "../constants";
import { FiringSide } from "../Templates/Player";

export class AnalyticsController {
    // app = app;
    // analytics = analytics;

    public static instance: AnalyticsController;
    public static track = true;

    gameplayStartedTime: number;
    matchesStarted: number = 0;
    loadingStartedTime: number;

    public static getInstance() {
        if (this.instance) {
            return this.instance;
        } else {
            this.instance = new AnalyticsController();

            return this.instance;
        }
    }

    clarity: any;

    private constructor() {
        this.clarity = (window as any)?.clarity;
        (window as any).WEB_VENDOR && (window as any)?.clarity?.('set', 'vendor', (window as any).WEB_VENDOR);
        this.addTag('map-type', 'small');
        this.addTag('device-type', is_mobile() ? 'mobile' : 'desktop');
    }

    public logScreenView(screenName: PageNames | 'game_over' | 'tutorial') {
        this.triggerEvent(`screen_view:${screenName}`);
    }

    // #region Loading of assets
    public logLoadingStarted() {
        this.loadingStartedTime = Date.now();
        this.triggerEvent('asset_loading_started');
    }
    public logLoadingEnded() {
        const loadingTime = (Date.now() - this.loadingStartedTime) / 1000;

        this.triggerEvent('asset_loading_ended');

        if (loadingTime <= 1) {
            this.triggerEvent('loadingTime_<=_1s');
        } else if (loadingTime <= 3) {
            this.triggerEvent('loadingTime_<=_3s');
        } else if (loadingTime <= 5) {
            this.triggerEvent('loadingTime_<=_5s');
        } else if (loadingTime <= 7) {
            this.triggerEvent('loadingTime_<=_7s');
        } else if (loadingTime <= 10) {
            this.triggerEvent('loadingTime_<=_10s');
        } else {
            this.triggerEvent('loadingTime_>_10');
        }
    }

    //#region Gameplay events
    public logGameplayStart() {
        this.gameplayStartedTime = Date.now();

        this.triggerEvent(`gameplay_start:respawns-${this.matchesStarted++}`);
    }
    public logGameplayEnd() {
        const gameplayLength = (Date.now() - this.gameplayStartedTime) / 1000;

        this.triggerEvent('gameplay_end');

        if (gameplayLength <= 5) {
            this.triggerEvent('gameplayLength_<=_5s');
        } else if (gameplayLength <= 10) {
            this.triggerEvent('gameplayLength_<=_10s');
        } else if (gameplayLength <= 15) {
            this.triggerEvent('gameplayLength_<=_15s');
        } else if (gameplayLength <= 20) {
            this.triggerEvent('gameplayLength_<=_20s');
        } else if (gameplayLength <= 25) {
            this.triggerEvent('gameplayLength_<=_25s');
        } else {
            this.triggerEvent('gameplayLength_>_25');
        }
    }

    //#region Movement keys used
    public logMovementUsed() {
        this.triggerEvent('movement_used');
    }
    //#region Firing used
    public logFiringUsed() {
        this.triggerEvent('firing_used');
    }

    //#region Is new player
    public logIsNew() {
        this.triggerEvent('IS_NEW');
    }

    //#region Has been onboarded
    public logAlreadyOnboarded() {
        this.triggerEvent('HAS_ALREADY_ONBOARDED');
    }

    //#region Shooting
    public logShoot(x: number, y: number, side: FiringSide) {
        const bucketName = getBucketName(x, y);
        console.log('logShoot:', bucketName);
        console.log('Shoot side:', side);

        const gunName = (() => {
            switch (side) {
                case FiringSide.FORWARD:
                    return 'FORWARD';
                case FiringSide.PORT:
                    return 'LEFT';
                case FiringSide.STARBOARD:
                    return 'RIGHT';
                case FiringSide.BACKWARD:
                    return 'BACKWARD';
            }
        })();

        this.triggerEvent(`shoot:bucket:${bucketName}`);
        this.triggerEvent(`shoot:side:${gunName}`);
    }

    public logShootDistFromChest(dist: number) {
        console.log('dist to chest:', dist);

        // this.triggerEvent('distToNearestChest', {
        //     value: dist,
        // });

        if (dist <= 30) {
            this.triggerEvent('dist_<=_30');
        } else if (dist <= 60) {
            this.triggerEvent('dist_<=_60');
        } else if (dist <= 100) {
            this.triggerEvent('dist_<=_100');
        } else if (dist <= 150) {
            this.triggerEvent('dist_<=_150');
        } else if (dist <= 200) {
            this.triggerEvent('dist_<=_200');
        } else {
            this.triggerEvent('dist_>_200');
        }
    }

    //#region FPS
    public logFPS(FPS: number) {
        if (FPS <= 30) {
            this.triggerEvent('fps_<=_30');
        } else if (FPS <= 60) {
            this.triggerEvent('fps_<=_60');
        } else if (FPS <= 100) {
            this.triggerEvent('fps_<=_100');
        } else if (FPS <= 150) {
            this.triggerEvent('fps_<=_150');
        } else if (FPS <= 200) {
            this.triggerEvent('fps_<=_200');
        } else {
            this.triggerEvent('fps_>_200');
        }
    }
    //#region Ping
    public logPing(ping: number) {
        if (ping <= 10) {
            this.triggerEvent('ping_<=_10');
        } else if (ping <= 30) {
            this.triggerEvent('ping_<=_30');
        } else if (ping <= 60) {
            this.triggerEvent('ping_<=_60');
        } else if (ping <= 100) {
            this.triggerEvent('ping_<=_100');
        } else if (ping <= 150) {
            this.triggerEvent('ping_<=_150');
        } else if (ping <= 200) {
            this.triggerEvent('ping_<=_200');
        } else {
            this.triggerEvent('ping_>_200');
        }
    }
    //#region Ping
    public logInitialPing(ping: number, server: SERVER_OPTION_NAMES) {
        if (ping <= 10) {
            this.triggerEvent(`initial_ping_${server}<=_10`);
        } else if (ping <= 30) {
            this.triggerEvent(`initial_ping_${server}<=_30`);
        } else if (ping <= 60) {
            this.triggerEvent(`initial_ping_${server}<=_60`);
        } else if (ping <= 100) {
            this.triggerEvent(`initial_ping_${server}<=_100`);
        } else if (ping <= 150) {
            this.triggerEvent(`initial_ping_${server}<=_150`);
        } else if (ping <= 200) {
            this.triggerEvent(`initial_ping_${server}<=_200`);
        } else {
            this.triggerEvent(`initial_ping_${server}>_200`);
        }
    }

    //#region Ping
    logServer(server: SERVER_OPTION_NAMES) {
        this.triggerEvent(`server_name:${server}`);
    }

    //#region Errors
    // Socket failed to connect
    public logSocketError(server: SERVER_OPTION_NAMES) {
        this.triggerEvent(`socket_error:${server}`);
    }
    // Webgpu/webgl2 isn't available
    public logWebGLGPUError(webGL2Available: boolean) {
        this.triggerEvent(`renderer_error:GL2-${webGL2Available}`,);
    }

    //#region Play button clicked
    public logPlayButtonClicked() {
        this.triggerEvent('play_button_clicked');
    }
    //#region Play button clicked
    public logNameInputFocused() {
        this.triggerEvent('name_input_focused');
    }
    //#region Sails modal opened
    public logSailsButtonClicked() {
        this.triggerEvent('sails_modal_opened');
    }
    //#region Name input focused
    public logSailsPicked(sailName: SAIL_NAMES) {
        this.triggerEvent(`sail_selected:${sailName}`);
    }

    public triggerEvent(eventName: any) {
        if ((window as any).__SB_TRACK) {
            console.log('AET:', eventName);
            // logEvent(analytics, eventName, options);
            this?.clarity?.('event', eventName);
        }
    }
    public addTag(key: string, value: string) {
        if ((window as any).__SB_TRACK) {
            console.log('ATS:', 'keys ->', key, 'value ->', value);
            this?.clarity?.('set', key, value);
        }
    }
    public stopTracking() {
        console.log('Stop Analytics');
        this.clarity = undefined;
    }
}
