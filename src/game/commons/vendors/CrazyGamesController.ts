import { video_ad_playing } from "../../../App";
import { ICGVideoAddCallbacks } from "../../../vite-env";
import { SERVER_OPTION_NAMES } from "../../constants";
// import {ICGVideoAddCallbacks} from './../../'

export enum InviteLinkParams {
    SERVER_NAME = 'serverName',
    ROOM_ID = 'roomID',
    INSTANT_JOIN = 'instantJoin',
}

export class CrazyGamesController {
    public static instance: CrazyGamesController;

    public serverName: SERVER_OPTION_NAMES
    public roomID: number;

    gameplayInProgress = false;
    canCycleBannerDuringThisRound = true;

    public static getInstance() {
        return (this.instance = this.instance ? this.instance : new CrazyGamesController());
    }

    sdk: {
        game: any;
        ad: any;
        banner: any;
        user: any;
        data: any;
    } | undefined;

    private constructor() {
        if (['local', 'crazygames'].includes((window as any)?.CrazyGames?.SDK?.environment)) {
            this.sdk = (window as any)?.CrazyGames?.SDK;
            this.serverName = this.getInviteParam(InviteLinkParams.SERVER_NAME) ?? new URLSearchParams(location.search).get('server') as SERVER_OPTION_NAMES;
            this.roomID = +(this.getInviteParam(InviteLinkParams.ROOM_ID) ?? new URLSearchParams(location.search).get('roomID') ?? -1);
        }
    }

    //#region Loading
    startLoading() {
        this?.sdk?.game?.loadingStart?.();
    }
    stopLoading() {
        this?.sdk?.game?.loadingStop?.();
    }

    //#region Gameplay Session
    startGameplaySession() {
        this.gameplayInProgress = true;
        this?.sdk?.game?.gameplayStart?.();
    }
    stopGameplaySession() {
        this.gameplayInProgress = false;
        this?.sdk?.game?.gameplayStop?.();
    }

    //#region Local Storage
    getItem(name: string) {
        return this?.sdk?.data?.getItem?.(name);
    }
    setItem(name: string, value: string) {
        this?.sdk?.data?.setItem?.(name, value);
    }
    clear() {
        this?.sdk?.data?.clear?.();
    }

    //#region Auth
    getUser() {
        return this?.sdk?.user?.getUser?.();
    }

    //#region Midgame ad
    requestVideoAd(type: 'midgame' | 'rewarded', callbacks: ICGVideoAddCallbacks) {
        return new Promise<void>((res, rej) => {
            if (this?.sdk?.ad) {
                // TODO: add res and rej calls
                this?.sdk?.ad?.requestAd(type, {
                    adError: (error: any) => {
                        callbacks?.adError?.();
                        rej(error);
                    },
                    adFinished: () => {
                        callbacks?.adFinished?.();
                        res();
                    },
                    adStarted: () => {
                        callbacks?.adStarted?.();
                    },
                } as ICGVideoAddCallbacks);
            } else {
                res();
            }
        });
    }
    requestMidGameVidAd(callbacks: ICGVideoAddCallbacks) {
        return this.requestVideoAd('midgame', callbacks);
    }
    requestRewardedVidAd(callbacks: ICGVideoAddCallbacks) {
        return this.requestVideoAd('rewarded', callbacks);
    }

    //#region Banner ads
    requestResponsiveBannerAd(id: 'menu-banner' | 'game-over-banner') {
        console.warn('Banner requested:', id);
        if (video_ad_playing()) {
            return Promise.reject('There is a video ad playing');
        }

        return this?.sdk?.banner?.requestResponsiveBanner?.(id);
    }
    clearAllBannerAds() {
        console.warn('Clear Banner requested');
        this?.sdk?.banner?.clearAllBanners?.();
    }

    //#region Invite link and button
    getInviteLink() {
        return this?.sdk?.game?.inviteLink?.(this.getInviteLinkObj());
    }
    showInviteButton() {
        return this?.sdk?.game?.showInviteButton?.(this.getInviteLinkObj());
    }
    hideInviteButton() {
        return this?.sdk?.game?.hideInviteButton?.();
    }
    getInviteParam(paramName: InviteLinkParams) {
        return this?.sdk?.game?.getInviteParam?.(paramName);
    }
    getInviteLinkObj() {
        return {
            [InviteLinkParams.ROOM_ID]: this.roomID,
            [InviteLinkParams.SERVER_NAME]: this.serverName,
        };
    }
}
