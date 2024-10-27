import { video_ad_playing } from "../../../App";
import { ICGVideoAddCallbacks } from "../../../vite-env";
import { SERVER_OPTION_NAMES } from "../../constants";
// import {ICGVideoAddCallbacks} from './../../'

export enum InviteLinkParams {
    SERVER_NAME = 'serverName',
    ROOM_ID = 'roomID',
    INSTANT_JOIN = 'instantJoin',
}

export class PokiController {
    public static instance: PokiController;

    public serverName: SERVER_OPTION_NAMES
    public roomID: number;

    gameplayInProgress = false;
    canCycleBannerDuringThisRound = true;

    public static getInstance() {
        return (this.instance = this.instance ? this.instance : new PokiController());
    }

    sdk: {
        gameLoadingFinished: () => void;
        gameplayStart: () => void;
        gameplayStop: () => void;
        commercialBreak: (onStart?: () => any) => Promise<void>;
        rewardedBreak: (onStart?: () => any) => Promise<boolean>;
        shareableURL: (params: { [key: string]: any }) => Promise<string>;
        getURLParam: (paramName: string) => any;
    } | undefined;

    private constructor() {
        this.sdk = (window as any).PokiSDK;
        this.serverName = this.getInviteParam(InviteLinkParams.SERVER_NAME) ?? new URLSearchParams(location.search).get('server') as SERVER_OPTION_NAMES;
        this.roomID = +(this.getInviteParam(InviteLinkParams.ROOM_ID) ?? new URLSearchParams(location.search).get('roomID') ?? -1);
    }

    //#region Loading
    startLoading() {
        // this?.sdk?.game?.loadingStart?.();
    }
    stopLoading() {
        // this?.sdk?.game?.loadingStop?.();
        this?.sdk?.gameLoadingFinished();
    }

    //#region Gameplay Session
    startGameplaySession() {
        // this.gameplayInProgress = true;
        this?.sdk?.gameplayStart?.();
    }
    stopGameplaySession() {
        // this.gameplayInProgress = false;
        this?.sdk?.gameplayStop?.();
    }

    //#region Midgame ad
    async requestMidGameVidAd(callbacks: ICGVideoAddCallbacks) {
        const gameOverScreen = document.getElementById('game-over');

        if (gameOverScreen) {
            gameOverScreen.style.display = 'none';
        }

        this?.sdk?.commercialBreak(() => callbacks?.adStarted?.()).then(() => {
            if (gameOverScreen) {
                gameOverScreen.style.display = '';
            }
            callbacks?.adFinished?.();
        }).catch(() => {
            callbacks?.adError?.();
        });
    }
    async requestRewardedVidAd(callbacks: ICGVideoAddCallbacks) {
        const gameOverScreen = document.getElementById('game-over');

        if (gameOverScreen) {
            gameOverScreen.style.display = 'none';
        }

        this?.sdk?.rewardedBreak(() => callbacks?.adStarted?.()).then((success) => {
            if (gameOverScreen) {
                gameOverScreen.style.display = '';
            }
            callbacks?.adFinished?.(success);
        }).catch(() => {
            callbacks?.adError?.();
        });
    }

    //#region Invite link and button
    getInviteLink() {
        return this?.sdk?.shareableURL?.(this.getInviteLinkObj());
    }
    getInviteParam(paramName: InviteLinkParams) {
        return this?.sdk?.getURLParam?.(paramName);
    }
    getInviteLinkObj() {
        return {
            [InviteLinkParams.ROOM_ID]: this.roomID,
            [InviteLinkParams.SERVER_NAME]: this.serverName,
        };
    }
}
