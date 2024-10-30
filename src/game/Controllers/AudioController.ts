import { Tween } from "@tweenjs/tween.js";
import { Audio, AudioListener, Object3D, PositionalAudio } from "three";
import { game_over, mute, opponents, set_mute } from "../../App";
import { AUDIO_NAMES, audio_repo } from "../audio_repo";
import { LocalStorageKeys } from "../commons/enums/LocalStorageKeys";
import { LocalStorageController } from "./LocalStorageController";

const HELP_TEXT_VOLUME = 0.52;

export class AudioController {
    public static instance: AudioController

    public static getInstance(listener?: AudioListener) {
        if (this.instance) {
            return this.instance;
        } else {
            if (!listener) {
                throw new Error();
            }

            this.instance = new AudioController(listener);

            return this.instance;
        }
    }

    positionalAudioList: Map<AUDIO_NAMES, PositionalAudio[]> = new Map();
    audioList: Map<AUDIO_NAMES, Audio> = new Map();
    masterGain: GainNode;
    audioCtx: AudioContext;

    lastPlayedDeclaration = 0;

    private constructor(public listener: AudioListener) {
        const context = this.audioCtx = listener.context;
        const masterGain = this.masterGain = context.createGain();

        masterGain.gain.setValueAtTime(0, context.currentTime);

        masterGain.connect(context.destination);

        if (mute()) {
            this.mute();
        } else {
            this.unmute();
        }

    }

    resumeContext() {
        this.listener.context.resume();
    }

    private play(name: AUDIO_NAMES, list: Map<AUDIO_NAMES, PositionalAudio> | Map<AUDIO_NAMES, Audio>, volume = 1) {
        const sound = list.get(name);

        if (!sound) {
            throw new Error('sound incorrect');
        }

        sound.setVolume(volume);
        sound.stop();
        sound.play();
        return sound;
    }
    private stop(name: AUDIO_NAMES, list: Map<AUDIO_NAMES, PositionalAudio> | Map<AUDIO_NAMES, Audio>) {
        const sound = list.get(name);

        if (!sound) {
            throw new Error('sound incorrect');
        }

        sound.stop();
        return sound;
    }

    public playAudio(name: AUDIO_NAMES, volume = 1) {
        return this.play(name, this.audioList, volume);
    }
    public stopAudio(name: AUDIO_NAMES) {
        return this.stop(name, this.audioList);
    }
    public playPositionalAudio(name: AUDIO_NAMES, volume = 1, mesh: Object3D) {
        const audArr = this.positionalAudioList.get(name);

        // console.log('playing:snd:list', audArr, name, this.positionalAudioList, mesh)
        // console.log('playing:mesh', mesh)

        if (audArr) {
            let snd = audArr.find(snd => !snd.isPlaying);
            // console.log('playing:snd', snd)

            if (!snd) {
                snd = this.createPositionalAudio(name);
                audArr.push(snd);
            }

            mesh.add(snd);
            snd.offset = 0;
            snd.setVolume(volume);
            snd.onEnded = () => {
                snd.removeFromParent();
                // console.log('playing sound', snd)
            };
            snd.play();
        }
    }

    public playHelpVoiceIntro() {
        !game_over() && this.playAudio(AUDIO_NAMES.HELP_WELCOME, HELP_TEXT_VOLUME);
    }
    public playHelpVoiceMovement() {
        !game_over() && this.playAudio(AUDIO_NAMES.HELP_MOVEMENT, HELP_TEXT_VOLUME);
    }
    public playHelpVoiceShooting() {
        !game_over() && this.playAudio(AUDIO_NAMES.HELP_FIRING, HELP_TEXT_VOLUME);
    }
    public playHelpVoiceOutro() {
        !game_over() && this.playAudio(AUDIO_NAMES.HELP_OUTRO, HELP_TEXT_VOLUME);
    }
    public stopAllAnouncements() {
        [
            AUDIO_NAMES.HELP_WELCOME,
            AUDIO_NAMES.HELP_MOVEMENT,
            AUDIO_NAMES.HELP_FIRING,
            AUDIO_NAMES.HELP_OUTRO,
        ].forEach(audKey => {
            this.stopAudio(audKey);
        });
    }
    public playGetBack() {
        this.stopAllAnouncements();
        this.playAudio(AUDIO_NAMES.GET_BACK, HELP_TEXT_VOLUME);
    }

    // Announcer
    public playChampionDeclaration() {
        if (!LocalStorageController.getItem(LocalStorageKeys.ONBOARDED)) return;
        if (!Object.keys(opponents()).length) return;

        const bossAud = this.audioList.get(AUDIO_NAMES.BOSS);

        if (!bossAud?.isPlaying) {
            this.playBossMusic();
        }

        if (Date.now() - this.lastPlayedDeclaration >= 1000 * 60 * 3) {
            this.lastPlayedDeclaration = Date.now();
            const snd = this.audioList.get(AUDIO_NAMES.CHAMPION_OF_THE_SEA)!;

            const oldEnded = snd.onEnded;

            snd.onEnded = () => {
                this.playAudio(AUDIO_NAMES.MAKE_THEM_REMEMBER, 1);
                oldEnded();
                snd.onEnded = oldEnded;
            };

            this.playAudio(AUDIO_NAMES.CHAMPION_OF_THE_SEA, 1);
        }
    }

    public playShipSink(mesh: Object3D, volume = 0.68) {
        this.playPositionalAudio(AUDIO_NAMES.SHIP_SINK, volume, mesh);
    }
    public playGunFire(mesh: Object3D, positional = true, volume = 0.34) {
        if (positional) {
            this.playPositionalAudio(AUDIO_NAMES.GUN_FIRE, volume, mesh);
        } else {
            this.playAudio(AUDIO_NAMES.GUN_FIRE, volume);
        }
    }
    public playGunFireTail(mesh: Object3D, volume = 0.34) {
        this.playPositionalAudio(AUDIO_NAMES.GUN_FIRE_TAIL, volume, mesh);
    }
    public playNoGunFire() {
        this.playAudio(AUDIO_NAMES.NO_GUN_FIRE, 0.07);
    }
    public playLevelUpShout(volume = 0.34) {
        this.playAudio(AUDIO_NAMES.LEVEL_UP_SHOUT, volume);
    }
    public playPickUp() {
        this.playAudio(AUDIO_NAMES.PICK_UP, 0.14);
    }
    public playMainMenuMusic() {
        // const snd = this.playAudio(AUDIO_NAMES.MAIN_MENU, 0.34);

        // snd.setLoop(true);
    }
    public stopGameOverMusic() {
        this.stopAudio(AUDIO_NAMES.GAME_OVER);
    }
    public async playGameOverMusic() {
        await this.stopBossMusic();

        const snd = this.playAudio(AUDIO_NAMES.GAME_OVER, 0.34);

        snd.setLoop(true);
    }
    public stopMainMenuMusic() {
        // this.stopAudio(AUDIO_NAMES.MAIN_MENU);
    }
    public playBossMusic() {
        const snd = this.playAudio(AUDIO_NAMES.BOSS, 0.00);

        new Tween({
            vol: 0,
        })
            .to({
                vol: 0.34,
            })
            .duration(2500)
            .onUpdate(obj => {
                snd.setVolume(obj.vol);
            })
            .start();

        snd.setLoop(true);
    }
    public async stopBossMusic() {
        const snd = this.audioList.get(AUDIO_NAMES.BOSS)!;

        if (!snd.isPlaying) return Promise.resolve();

        return new Promise<void>(res => {
            new Tween({
                vol: snd.getVolume(),
            })
                .to({
                    vol: 0,
                })
                .duration(1400)
                .onUpdate(obj => {
                    snd.setVolume(obj.vol);
                })
                .onComplete(() => {
                    snd.stop();
                    res();
                })
                .start();
        })
    }

    public playHitSound() {
        this.playAudio(AUDIO_NAMES.SHIP_HIT, 0.34);
    }

    public mute = () => {
        set_mute(true);
        this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.7);
        // const ambienceSnd = document.getElementById('ambience') as HTMLAudioElement;
        // ambienceSnd.muted = true;
    }

    public unmute = () => {
        set_mute(false);
        this.masterGain.gain.exponentialRampToValueAtTime(1, this.audioCtx.currentTime + 0.7);
        // const ambienceSnd = document.getElementById('ambience') as HTMLAudioElement;
        // ambienceSnd.muted = false;
    }

    public destroy() {
        this.audioList.forEach(aud => {
            aud.disconnect();
            aud.removeFromParent();
            aud.clear();
        });
        this.positionalAudioList.forEach(auds => {
            auds.forEach(aud => {
                aud.disconnect();
                aud.removeFromParent();
                aud.clear();
            });
        });
    }

    private createPositionalAudioPool = (key: AUDIO_NAMES) => {

        this.positionalAudioList.set(key, new Array(25).fill(1).map(_ => {
            const sound = this.createPositionalAudio(key);

            // console.log('positional snd:', sound);

            return sound;
        }));
    }

    private createPositionalAudio(key: AUDIO_NAMES) {
        const sound = new PositionalAudio(this.listener);
        sound.setRefDistance(10);
        // sound.setMaxDistance(20);
        sound.setRolloffFactor(2);
        sound.setDistanceModel('exponential');
        sound.setBuffer(audio_repo[key]);
        sound.setLoop(false);
        sound.onEnded = () => {
            sound.removeFromParent();
            sound.stop();
        };
        // console.log('sound:', sound)

        sound.gain.disconnect();
        sound.gain.connect(this.masterGain);

        return sound;
    }
}