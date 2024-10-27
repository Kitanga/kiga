import { remove, Tween } from "@tweenjs/tween.js";
import msgpack from 'msgpack-lite';
import { Group, Mesh, Object3D, Scene, Vector3 } from "three";
import { seededRandom } from "three/src/math/MathUtils.js";
import { boss_id, game_over, IOpponent, is_mobile, mute, opponents, opponents_repo, selected_sail, set_boss_health, set_chat, set_crates, set_damage_attr, set_disconnected, set_game_over, set_health_attr, set_opponents, set_ping, set_range_attr, set_reload_time_attr, set_speed_attr, set_turn_speed_attr, set_upgrades, set_user_level, set_user_xp, username } from "../../App";
import { LocalStorageKeys } from "../commons/enums/LocalStorageKeys";
import { NOTIFICATION_TEXT } from "../commons/enums/NOTIFICATION_TEXT";
import { animateNewLevel } from "../commons/utils/animateNewLevel";
import { createText } from "../commons/utils/createText";
import { getBucketKey } from "../commons/utils/getBucketKey";
import { getLevel } from "../commons/utils/getLevel";
import { CrazyGamesController, InviteLinkParams } from "../commons/vendors/CrazyGamesController";
import { ATTRIBUTES, CAMERA_POS, GAME_SIZE, ISLAND_HEIGHT_VARIANTS, MAP_SPECIAL_INDICATOR, SERVER_OPTION_NAMES, SERVER_OPTIONS, SERVER_UPDATE_TICK } from "../constants";
import { Crate } from "../Templates/Crate";
import { Entity, EntityType } from "../Templates/Entity";
import { Island } from "../Templates/Island";
import { Player } from "../Templates/Player";
import { AnalyticsController } from "./AnalyticsController";
import { AudioController } from "./AudioController";
import { IslandInstanceController } from "./IslandInstanceController";
import { LocalStorageController } from "./LocalStorageController";
import { NotifierController } from "./NotifierController";
import { ShipInstanceController } from "./ShipInstanceController";
import { cycleBanner } from "../commons/utils/cycleBanner";
import { gameOverMidgameAdfinished } from "../commons/utils/gameOverMidgameAdFinished";
import { PokiController } from "../commons/vendors/PokiController";


export interface ITransformPayload {
    x: number
    y: number
    dx: number
    dy: number
}

export interface IUpdatePayload extends ITransformPayload {
    /** A list of all the IDs of crates you are currently colliding with */
    crc: number[];
}

export class NetController {
    static DEFAULT_SERVER_OPTION = SERVER_OPTION_NAMES.DE_NUREMBERG;

    DT = SERVER_UPDATE_TICK;
    next = 0;

    socket: WebSocket;

    entities = new Map<string, Entity>();
    crates = new Map<string, Crate>();
    islands = new Map<string, Island>();

    playerEntities = new Map<string, {
        x: number,
        y: number,
        dx: number,
        dy: number,
        id: string,
        gameObject: Mesh
    }>();

    lastPing = performance.now();
    ping = SERVER_UPDATE_TICK * 2;
    intervalID: NodeJS.Timeout;
    updateIntervalID: NodeJS.Timeout;

    previousUpdatePayload!: ITransformPayload;

    public static instance: NetController
    id = '';

    crateBins = new Map<any, Map<string, Crate>>();
    islandsBins = new Map<any, Island[]>();
    islandInstanceController: IslandInstanceController;

    public static getInstance(scene?: Scene, playerGameObject?: Player) {
        if (this.instance) {
            return this.instance;
        } else if (scene && playerGameObject) {
            this.instance = new NetController(scene, playerGameObject);

            return this.instance;
        }
    }

    instanceController = ShipInstanceController.getInstance();

    private constructor(public scene: Scene, public player: Player) {
        player.net = this;
    }

    update(dt: number) { }

    // #region Connect
    async connect() {
        // const CG = CrazyGamesController.getInstance();
        const Poki = PokiController.getInstance();

        let serverName = Poki.getInviteParam(InviteLinkParams.SERVER_NAME) || new URLSearchParams(location.search).get(InviteLinkParams.SERVER_NAME) as SERVER_OPTION_NAMES;

        let server: string | undefined = '';
        const localhostServer = 'ws://localhost:3000/ws';
        // location.hostname == 'localhost' ?
        // 'ws://localhost:3000/ws'
        // :

        if (serverName) {
            server = `wss://${SERVER_OPTIONS.get(serverName)?.url}/ws` || localhostServer;
        } else if (location.hostname == 'localhost') {
            server = localhostServer;
            serverName = SERVER_OPTION_NAMES.LOCALHOST;
        } else {
            server = `wss://${SERVER_OPTIONS.get(NetController.DEFAULT_SERVER_OPTION)?.url}/ws` || localhostServer;
            serverName = NetController.DEFAULT_SERVER_OPTION;
        }

        Poki.serverName = serverName;

        const protocol = location.protocol.replace('http', '').replace(':', '');

        console.log('protocol:', protocol);
        console.log('servername:', serverName);
        console.log('server:', server);
        console.log('server roomID:', Poki.roomID);

        AnalyticsController.getInstance().logServer(serverName);

        this.socket = new WebSocket(
            server
        );

        this.socket.onmessage = (ev) => {
            const decoded = msgpack.decode(new Uint8Array(ev.data)) as any;

            this.handleMessage(decoded);
        };
        this.socket.binaryType = 'arraybuffer';
        this.socket.onclose = () => {
            console.log('closed ws');

            this.handleSocketClose();
        };
        this.socket.onopen = () => {
            set_game_over(false);

            console.log('Opened');

            const { player, entities, socket, crates } = this;

            const initialPayload: any = {
                // x: player.mesh.position.x,
                // y: player.mesh.position.z,
                // dx: player.forward.x,
                // dy: player.forward.z,
                u: username() || '',
                sl: selected_sail() || '',
                new: !LocalStorageController.getItem(LocalStorageKeys.ONBOARDED),
                isMobile: is_mobile(),
                // new: true,
                // new: false,
            };

            if (Poki.roomID > -1) {
                initialPayload.rID = Poki.roomID;
            }

            const payload = {
                e: 'INITIAL',
                d: initialPayload,
            };

            console.log('initial payload:', payload);

            this.socket.send(msgpack.encode(payload));

            // Send a ping every 20 seconds
            const ping = (isFirst = false) => {
                if (socket.readyState !== socket.OPEN) {
                    console.log('socket already closed')
                    return;
                }

                if ((performance.now() - player.lastInput > 60000)) {
                    // set_game_over(true);
                    socket.close();

                    this.entities.forEach(entity => entity.kill());

                    if (!game_over()) {
                        player.kill();

                        const oldMuted = mute();

                        const adFinished = () => {
                            gameOverMidgameAdfinished(oldMuted);
                        };

                        if (Poki.sdk) {
                            AudioController.getInstance().mute();
                            adFinished();
                        } else {
                            adFinished();
                        }
                    }
                    console.log('socket closed:', socket);

                    return;
                }

                const data = {
                    first: isFirst,
                } as any;

                if (!isFirst) {
                    data.ping = this.ping;
                }

                this.sendMessage('PING', data);

                this.lastPing = performance.now();
            };
            ping(true);
            this.intervalID = setInterval(() => ping(), 5000);
            this.updateIntervalID = setInterval(() => {
                if (socket.readyState == socket.OPEN && player.health > 0) {
                    const {
                        mesh,
                        forward,
                        colliding,
                        collidingSent
                    } = player;

                    const data = {
                        x: mesh.position.x,
                        y: mesh.position.z,
                        dx: forward.x,
                        dy: forward.z,
                        crc: colliding,
                    } as IUpdatePayload;
                    const payload = {
                        e: 'UPDATE',
                        d: data
                    };

                    socket.send(msgpack.encode(payload));

                    // Add sent crates you colliding with, this way you don't try sending a request for said crate again
                    colliding.forEach(id => {
                        collidingSent.add(id);
                    });

                    colliding.length = 0;
                }
            }, SERVER_UPDATE_TICK);
            this.update = (dt: number) => {
                entities.forEach(entity => entity?.update(dt));
                // crates.forEach(crate => crate?.update(dt));
            };
        };

        this.socket.onerror = () => {
            AnalyticsController.getInstance().logSocketError(serverName);
        };
    }

    // #region Disconnect
    disconnect() {
        this.socket.close();
        this.destroy();
        set_game_over(true);
    }

    // #region OnClose
    onClose() { }

    // #region Destroy
    destroy() {
        this.entities.forEach(entity => {
            entity?.destroy?.();
        });
    }

    // #region SendMessage
    sendMessage(event: string, message?: any) {
        this.socket.send(msgpack.encode({
            e: event,
            d: message,
        }));
    }

    // #region 
    resetScene() {
        this.entities.forEach(eT => {
            eT.mesh.removeFromParent();
            eT.meshInner.removeFromParent();
            eT.meshSubstitute.removeFromParent();
        });
        this.crates.forEach(eT => {
            eT.mesh.removeFromParent();
        });
        this.islands.forEach(eT => {
            eT.object.removeFromParent();
        });
        this.entities.clear();
        this.crates.clear();
        this.islands.clear();

        this.crateBins.clear();
        this.islandsBins.clear();

        ShipInstanceController.getInstance().fillIXs();
        IslandInstanceController.getInstance().latestInstanceIX = 0;

        // for (let key of opponents_repo) {
        //     delete opponents_repo[key];
        // }
        set_crates({});
        set_opponents({});
    }

    // #region HandleMessage
    private handleMessage(payload: {
        e: string
        d?: any
    }) {

        const { e, d } = payload;

        // window.p = payload;

        // @ts-ignore
        window.n = this;
        // @ts-ignore
        // window.b = opponents;

        const { player } = this;

        switch (e) {
            // #region New connection, you receive a list of new connections from server
            case 'NC':
                this.id = d.id || this.id;
                console.log('new client NC:', d, this.id);
                const data = (d as { clients: { x: number, y: number, dx: number, dy: number, id: string, h: number, mxh: number, u: string, sl: string, sc: number }[], id: string });

                if (d.wp) {
                    this.resetScene()
                }

                ; data?.clients?.map?.(client => {
                    console.log('has entity NC:', this.entities.has(client.id));

                    if (!this.entities.has(client.id)) {
                        const entity = new Entity(this.scene, EntityType.PLAYER, client.id, this.player.camera, this);
                        this.entities.set(client.id, entity);

                        entity.net = this;

                        console.log('new client:', entity);

                        entity.health = client.h ?? 0;
                        entity.maxHealth = client.mxh ?? entity.maxHealth;
                        entity.score = client.sc ?? 0;
                        entity.setTransform(client as any);
                        entity.setTarget(client);

                        entity.user = client.u || entity.user;
                        entity.updateName(entity.user);

                        entity.instanceController = ShipInstanceController.getInstance();
                        try {
                            entity.instanceIX = entity.instanceController.getInstanceID()!;
                        } catch (err) { }

                        if (!entity.mesh.visible && entity.health > 0) {
                            entity.mesh.visible = true;
                        } else if (entity.health <= 0) {
                            entity.mesh.visible = false;
                        }
                        if (!entity.headerSection.visible && entity.health > 0) {
                            entity.headerSection.visible = true;
                        } else if (entity.health <= 0) {
                            entity.headerSection.visible = false;
                        }

                        if (client.sl) {
                            console.log('adding color:', client.sl)
                            entity.setSailsSkin(client.sl);
                        }

                        set_opponents(prev => {
                            return {
                                ...prev,
                                [entity.id]: {
                                    x: client.x / GAME_SIZE,
                                    y: client.y / GAME_SIZE,
                                    score: entity.score,
                                    name: entity.user,
                                } as IOpponent,
                            }
                        });

                        // opponents_repo[entity.id] = {
                        //     x: client.x / GAME_SIZE,
                        //     y: client.y / GAME_SIZE,
                        //     score: entity.score,
                        //     name: entity.user,
                        // } as IOpponent;

                        console.log('New client added:', this.entities.get(client.id));
                    }
                });

                if (d.cr) {
                    const {
                        crateBins,
                    } = this;

                    d.cr.forEach((crate: any) => {
                        const { x, y, id } = crate;

                        const entity = new Crate(this.scene, x, y, +id, crate.s);

                        const bucketKey = getBucketKey(x, y);

                        const crateBin = crateBins.get(bucketKey);

                        if (crateBin) {
                            crateBin.set(id, entity);
                        } else {
                            const newCrateBin = new Map([
                                [id, entity],
                            ]);

                            crateBins.set(bucketKey, newCrateBin);
                        }

                        entity.binKey = bucketKey;

                        this.crates.set(id, entity);

                        if (typeof crate.s == 'number') {
                            set_crates(prev => {
                                return {
                                    ...prev,
                                    [id.toString()]: {
                                        x: x / GAME_SIZE,
                                        y: y / GAME_SIZE,
                                        specialty: crate.s
                                    },
                                }
                            });
                        }
                    });

                    console.log('cratebins:', crateBins);
                }

                if (d.is) {
                    const {
                        islandsBins,
                    } = this;

                    d.is.forEach(({ x, y, r: rot, id }: {
                        /** X Position */
                        x: number,
                        /** Y Position */
                        y: number,
                        /** Rotation */
                        r: number,
                        /** ID string */
                        id: string,
                    }) => {
                        const islandObj = new Object3D();

                        islandObj.matrixAutoUpdate = islandObj.matrixWorldAutoUpdate = false;

                        const variant = ISLAND_HEIGHT_VARIANTS[
                            Math.min(
                                ISLAND_HEIGHT_VARIANTS.length - 1,
                                Math.floor(ISLAND_HEIGHT_VARIANTS.length * seededRandom(+id))
                            )
                        ];

                        islandObj.position.setX(x).setY(variant).setZ(y);
                        islandObj.rotation.y = rot;

                        islandObj.updateMatrix();

                        this.islandInstanceController.updateMesh(+id, islandObj);

                        const island = new Island(islandObj, 1.9);

                        this.islands.set(id, island);

                        const bins = new Set<number>();

                        ;[
                            [1, 0],
                            [-1, 0],
                            [0, 0],
                            [0, 1],
                            [0, -1],
                        ].forEach(([xMult, yMult]) => {
                            const xPos = xMult * island.r + x;
                            const yPos = yMult * island.r + y;

                            bins.add(getBucketKey(xPos, yPos));
                        });

                        bins.forEach(bucketKey => {
                            const islandBin = islandsBins.get(bucketKey);

                            if (islandBin) {
                                islandBin.push(island);
                            } else {
                                const newIslandBin = [island];

                                islandsBins.set(bucketKey, newIslandBin);
                            }

                            // this.groups.get(bucketKey)?.add(islandObj)
                        });
                    });

                    console.log('island bins:', islandsBins);
                }
                break;
            //#region UPDATE & INITIAL
            case 'UPDATE':
            case 'INITIAL':
                {
                    const entity = this.entities.get(d.id);
                    // console.log('update', payload)
                    // window.e = d.id

                    if (entity) {

                        if (e == 'INITIAL') {
                            console.log('sent initial to all:', entity);

                            // entity.mesh.visible = true;
                            entity.tweens?.forEach?.(tween => {
                                remove(tween);
                            });
                            // entity.meshInner.position.set(0.804959774017334, 1, 0);
                            // entity.meshInner.rotation.set(0, 0, 0);
                            entity.mesh.position.x = d.x;
                            entity.mesh.position.z = d.y;

                            entity.setTransform(d);
                            entity.setTarget(d);

                            entity.score = d.sc;

                            entity.maxHealth = d?.mxh ?? entity.maxHealth;

                            console.log('Finished initialization:', entity.mesh
                                .position.x, entity.mesh.position.z);

                            entity.health = entity.maxHealth;

                            entity.user = d.u || entity.user;
                            entity.updateName(entity.user);

                            if (d.sl) {
                                entity.setSailsSkin(d.sl);
                            }

                            if (d.u) {
                                entity.user = d.u || entity.user;
                                entity.updateName(entity.user);
                            }
                        }

                        entity.health = d.h ?? entity.health;

                        if (d.sc) {
                            entity.score = d.sc;
                        }

                        if (d.crc) {
                            d.crc.forEach((crate: any) => {
                                this.updateCrate(crate, false);
                            });
                        }

                        entity.maxHealth = d.mxh ?? entity.maxHealth;

                        if (entity.id == boss_id()) {
                            set_boss_health(entity.health / entity.maxHealth);
                        }

                        if (!entity.mesh.visible && entity.health > 0) {
                            entity.mesh.visible = true;
                        } else if (entity.health <= 0) {
                            entity.mesh.visible = false;
                        }
                        if (!entity.headerSection.visible && entity.health > 0) {
                            entity.headerSection.visible = true;
                        } else if (entity.health <= 0) {
                            entity.headerSection.visible = false;
                        }

                        // console.log('update:', d)
                        // window.d = d;
                        entity.setTarget(d);
                        entity.user = d.u || entity.user;

                        if (entity.health > 0) {
                            set_opponents(prev => {
                                return {
                                    ...prev,
                                    [d.id]: {
                                        x: d.x / GAME_SIZE,
                                        y: d.y / GAME_SIZE,
                                        score: entity.score,
                                        name: entity.user,
                                    },
                                }
                            });
                            // opponents_repo[d.id] = {
                            // x: d.x / GAME_SIZE,
                            // y: d.y / GAME_SIZE,
                            // score: entity.score,
                            // name: entity.user,
                            // };
                        } else {
                            // console.log('h:', entity.health)
                        }
                    } else {
                        // console.log('new push forward:', d, e, entity, this.entities)
                        // this.handleMessage({ e: 'NC', d: [d] });
                    }
                }
                break;
            //#region Connection Close
            case 'CC':
                const entity = this.entities.get(d);
                console.log(d, 'close', entity);

                if (entity) {
                    ShipInstanceController.getInstance().returnInstanceID(entity.instanceIX);
                    entity.mesh?.removeFromParent();
                    entity.meshSubstitute?.removeFromParent();
                    entity.headerSection?.removeFromParent();

                    this.entities.delete(d);
                    set_opponents(prev => {
                        const newOpponents = {
                            ...prev,
                        };

                        delete newOpponents[d];

                        return newOpponents
                    });
                    // delete opponents_repo[d];
                }
                break;
            //#region PONG
            case 'PONG':
                this.ping = performance.now() - this.lastPing;
                set_ping(this.ping);

                const analyticsInstance = AnalyticsController.getInstance();

                if (analyticsInstance) {
                    analyticsInstance.logFPS(player.fps);
                    analyticsInstance.logPing(this.ping);
                }
                break;
            //#region CHAT
            case 'CHAT':
                set_chat(prev => {
                    const newMessage = { user: d.u, content: d.c };

                    return [...prev, newMessage];
                });
                break;
            //#region Chat Confirmation
            case 'CHAT_CONFIRM':
                set_chat(prev => {
                    const newMessage = { user: username(), content: d.c };

                    return [...prev, newMessage];
                });
                break;
            //#region Damage report
            case 'DMG_RPT':
                try {
                    console.log('damage report data:', d, 'attacked:', d.id, 'attacking id:', d.atk, 'my id:', this.id);

                    const attackerID = d.atkid;
                    const attackerH = d.atkh;
                    const attackerMXH = d.atkmxh;
                    const attackerSC = d.atksc;

                    const attackerEntity = this.entities.get(attackerID);

                    d?.upt?.forEach((entityUpdate: { id: string, h: number, isd: boolean, attr: number[], xp: number }) => {
                        const attackedID = entityUpdate.id;
                        const newHealth = entityUpdate.h;
                        const isDead = entityUpdate.isd;
                        const attr = entityUpdate.attr;
                        const xp = entityUpdate.xp;

                        // const { x, y, dx, dy } = d;


                        // This player is currently being attacked
                        if (this.id == attackedID) {
                            const { player } = this;

                            player.health = newHealth;

                            if (isDead) {
                                // player.reset(d)
                                player.kill();
                                player.xp = xp;
                                attr?.forEach((val: number, ix: ATTRIBUTES) => {
                                    switch (ix) {
                                        case ATTRIBUTES.HEALTH:
                                            set_health_attr(val);
                                            break;
                                        case ATTRIBUTES.DAMAGE:
                                            set_damage_attr(val);
                                            break;
                                        case ATTRIBUTES.SPEED:
                                            set_speed_attr(val);
                                            break;
                                        case ATTRIBUTES.TURN_SPEED:
                                            set_turn_speed_attr(val);
                                            break;
                                        case ATTRIBUTES.RANGE:
                                            set_range_attr(val);
                                            break;
                                        case ATTRIBUTES.RELOAD_TIME:
                                            set_reload_time_attr(val);
                                            break;
                                    }
                                });
                                set_user_xp(xp);
                                set_user_level(getLevel(xp));

                                //#region Show midgame banner
                                const oldMuted = mute();

                                // const CG = CrazyGamesController.getInstance();
                                const Poki = PokiController.getInstance();

                                const adFinished = () => {
                                    gameOverMidgameAdfinished(oldMuted);
                                };

                                if (Poki.sdk) {
                                    setTimeout(() => {
                                        // Show midgame ad
                                        Poki.requestMidGameVidAd({
                                            adStarted() {
                                                AudioController.getInstance().mute();
                                            },
                                            adFinished,
                                            adError: adFinished,
                                        });
                                    }, 2000);
                                } else {
                                    adFinished();
                                }
                            }

                        } else {
                            const attackedEntity = this.entities.get(attackedID);

                            if (attackedEntity) {
                                attackedEntity.health = newHealth;

                                if (isDead) {
                                    console.log('killed this entity:', attackedEntity)
                                    // attackedEntity.setTransform({
                                    //     x, y, dx, dy,
                                    // });
                                    attackedEntity.mesh.visible && attackedEntity.kill();
                                    set_opponents(prev => {
                                        const newOpponents = {
                                            ...prev,
                                        };

                                        delete newOpponents[attackedEntity.id];

                                        return newOpponents
                                    });
                                    // delete opponents_repo[attackedEntity.id];
                                }

                                // TODO: place damage particles here
                            }
                        }
                    });

                    if (!attackerEntity) return;

                    // if (d.mss) {
                    //     const misses = d.mss;

                    //     misses.forEach((miss: IHitPoint) => {
                    //         if (miss.hit) {
                    //             attackerEntity.
                    //         }
                    //         SplashController.triggerSplash(miss.x, miss.y);
                    //     });
                    // }

                    if (typeof d.t !== 'undefined' && attackerEntity) {
                        attackerEntity.fire(d.t, d.mss);
                    }

                    if (typeof attackerH != 'undefined') {
                        attackerEntity.health = attackerH;
                    }
                    if (typeof attackerMXH != 'undefined') {
                        attackerEntity.maxHealth = attackerMXH;
                    }

                    attackerEntity.score = d.sc ?? attackerEntity.score;
                } catch (err) {
                    console.error("Error in damage rep " + err);
                }
                break;
            //#region Damage confirmation
            case 'DMG_CFM':
                try {
                    console.log('damage done data:', d);
                    console.log('I', this.id, 'am attacking', d.id);

                    player.health = d?.h ?? player.health;
                    player.score = d?.sc ?? player.score;
                    player.xp = d?.xp ?? player.xp;

                    set_user_xp(player.xp);

                    animateNewLevel(player.xp);

                    d?.upt?.forEach((data: { id: string, h: number, isd: boolean, sc: number, attr: number[] }) => {
                        const { id, h, isd, sc, attr } = data;

                        const attackedEntity = this.entities.get(id);

                        if (attackedEntity) {
                            attackedEntity.health = h;
                            attackedEntity.score = sc;

                            if (isd) {
                                attackedEntity.mesh.visible && attackedEntity.kill();

                                attackedEntity.maxHealth = attr?.[ATTRIBUTES.HEALTH];

                                set_opponents(prev => {
                                    const newOpponents = {
                                        ...prev,
                                    };
                                    delete newOpponents[id];
                                    return newOpponents;
                                });
                                // delete opponents_repo[id];
                            }
                        }
                    });

                    d?.attr?.forEach((val: number, ix: ATTRIBUTES) => {
                        switch (ix) {
                            case ATTRIBUTES.HEALTH:
                                set_health_attr(val);
                                break;
                            case ATTRIBUTES.DAMAGE:
                                set_damage_attr(val);
                                break;
                            case ATTRIBUTES.SPEED:
                                set_speed_attr(val);
                                break;
                            case ATTRIBUTES.TURN_SPEED:
                                set_turn_speed_attr(val);
                                break;
                            case ATTRIBUTES.RANGE:
                                set_range_attr(val);
                                break;
                            case ATTRIBUTES.RELOAD_TIME:
                                set_reload_time_attr(val);
                                break;
                        }
                    });
                } catch (err) {
                    console.error('Error in damage confirming ' + err);
                }
                break;
            //#region SPAWN
            case 'SPAWN':
                try {
                    console.log('spawning player:', d);

                    // const CG = CrazyGamesController.getInstance();
                    const Poki = PokiController.getInstance();

                    Poki.startGameplaySession();
                    AnalyticsController.getInstance().logGameplayStart();

                    if (typeof d.rID == 'number') {
                        Poki.roomID = d.rID;
                    }

                    player.reset(d);

                    d?.scs.forEach((client: { id: string, sc: number }) => {
                        const entity = this.entities.get(client.id);

                        if (entity) {
                            entity.score = client.sc || entity.score;
                        }
                    });

                    if (!is_mobile() && !LocalStorageController.getItem(LocalStorageKeys.ONBOARDED)) {
                        const audioController = AudioController.getInstance();

                        setTimeout(() => {
                            audioController.playHelpVoiceIntro();
                            NotifierController.showInfoNotif(NOTIFICATION_TEXT.HELP_TEXT_1, 2500 * 2.5);

                            setTimeout(() => {
                                audioController.playHelpVoiceMovement();
                                NotifierController.showInfoNotif(NOTIFICATION_TEXT.HELP_TEXT_2, 5900 * 2.5);

                                setTimeout(() => {
                                    audioController.playHelpVoiceShooting();
                                    NotifierController.showInfoNotif(NOTIFICATION_TEXT.HELP_TEXT_3, 10400);

                                    setTimeout(() => {
                                        audioController.playHelpVoiceOutro();
                                        NotifierController.showInfoNotif(NOTIFICATION_TEXT.HELP_TEXT_4, 3400);

                                        LocalStorageController.setItem(LocalStorageKeys.ONBOARDED, 'true');
                                        player.dirOnboarded = true;
                                    }, 15100);
                                }, 5900);
                            }, 2500);
                        }, 1000);
                    } else {
                        LocalStorageController.setItem(LocalStorageKeys.ONBOARDED, 'true');
                        player.dirOnboarded = true;
                    }
                } catch (err) {
                    console.error("Error in spawning " + err);
                }
                break;
            //#region REC
            case 'REC':
                try {
                    console.log('reconcile:', player.speed, d);
                    player.mesh.position.set(d.x || 0, 0, d.y || 0);
                    player.forward.set(d.dx || 0, 0, d.dy || 0);
                    player.forward.setLength(1);
                    player.camera.position.set(d.x || 0, 0, d.y || 0).add(CAMERA_POS);
                    player.controls.update();
                } catch (err) {
                    console.error("Error reconciling " + err);
                }
                break;
            //#region Crate Pickup confirmation
            case 'CR_CFM':
                try {
                    d.crc.forEach((crate: any) => {
                        this.updateCrate(crate);
                    });

                    if (d.b) {
                        set_upgrades(new Array(3).fill(0).map((_, ix) => d.b[ix] || 0));
                    }

                    d?.attr?.forEach((val: number, ix: ATTRIBUTES) => {
                        switch (ix) {
                            case ATTRIBUTES.HEALTH:
                                set_health_attr(val);
                                break;
                            case ATTRIBUTES.DAMAGE:
                                set_damage_attr(val);
                                break;
                            case ATTRIBUTES.SPEED:
                                set_speed_attr(val);
                                break;
                            case ATTRIBUTES.TURN_SPEED:
                                set_turn_speed_attr(val);
                                break;
                            case ATTRIBUTES.RANGE:
                                set_range_attr(val);
                                break;
                            case ATTRIBUTES.RELOAD_TIME:
                                set_reload_time_attr(val);
                                break;
                        }
                    });

                    player.health = d.h ?? player.health;
                    player.maxHealth = d.mxh ?? player.maxHealth;
                    player.score = d.sc ?? player.score;
                    player.xp = d.xp ?? player.xp;

                    set_user_xp(player.xp);

                    console.log('cr_cfm:d:', d);

                    if (!animateNewLevel(player.xp)) AudioController.getInstance().playPickUp();
                } catch (err) {
                    console.error("Error in crate " + err);
                }
                break;
        }
    }

    private updateCrate(crate: any, isPlayer = true) {
        // Remove from the collisionSent cache
        this.player.collidingSent.delete(+crate.id);

        const entity = this.crates.get(crate.id.toString());

        if (entity) {
            // if (typeof crate.s != 'number') {
            // Show text of what's been healed

            if (isPlayer) {
                const startingY = 0.5;

                const texts: [string, number][] = [];

                if (typeof crate.s == 'number') {

                    // switch(crate.s) {

                    // }

                    // texts.push([perkText, 0x00ff00]);

                    // perkText = getCachedText(TextType.PICK_ME);
                    // texts.push(TextType.CHEST);
                    texts.push(...[
                        ['HEALx2', 0x00ff00],
                        ['SCOREx2', 0x00ff00],
                        ['XPx2', 0x00ff00],
                    ] as any)

                    switch (crate.oldS as MAP_SPECIAL_INDICATOR) {
                        case MAP_SPECIAL_INDICATOR.HEALTH:
                            texts.push(['HEALTH BONUS', 0x00ff00]);
                            break;
                        case MAP_SPECIAL_INDICATOR.DAMAGE:
                            texts.push(['DAMAGE BONUS', 0x00ff00]);
                            break;
                        case MAP_SPECIAL_INDICATOR.SPEED:
                            texts.push(['SPEED BONUS', 0x00ff00]);
                            break;
                        case MAP_SPECIAL_INDICATOR.TURN_SPEED:
                            texts.push(['TURN SPEED BONUS', 0x00ff00]);
                            break;
                        case MAP_SPECIAL_INDICATOR.RANGE:
                            texts.push(['RANGE BONUS', 0x00ff00]);
                            break;
                        case MAP_SPECIAL_INDICATOR.RELOAD_TIME:
                            texts.push(['RELOAD TIME BONUS', 0x00ff00]);
                            break;
                    }
                } else {
                    // texts.push(TextType.CRATE);
                    texts.push(...[
                        ['+heal', 0x00ff00],
                        ['+score', 0x00ff00],
                        ['+XP', 0x00ff00],
                    ] as any)
                }

                // let offSet = 0;

                texts.forEach(([text, colour], ix) => {
                    const textMesh = createText(text, colour, 0.34);

                    const oldTween = textMesh.userData.tween;
                    oldTween?.stop?.()?.end?.();

                    textMesh.userData.tween = undefined;

                    const textPos = entity.mesh.position.clone().sub(textMesh.geometry.boundingBox!.getCenter(new Vector3()));
                    textMesh.position.copy(textPos);
                    // textMesh.rotation.x = Math.PI * 0.5;
                    textMesh.position.y = startingY + (ix * 0.5);

                    this.scene.add(textMesh);


                    const mainTextMat = Array.isArray(textMesh.material) ? textMesh.material[0] : textMesh.material;

                    mainTextMat.opacity = 1;

                    const tween = textMesh.userData.tween = new Tween(mainTextMat)
                        .to({
                            opacity: 1,
                        })
                        .duration(1400)
                        .delay(ix * 250)
                        .onComplete(() => {
                            const twn = textMesh.userData?.tween;

                            if (twn == tween) {
                                setTimeout(() => {
                                    textMesh.userData.tween = new Tween(mainTextMat)
                                        .to({
                                            opacity: 1,
                                        })
                                        .duration(700)
                                        .onComplete(() => {
                                            textMesh.removeFromParent();
                                        })
                                        .start();
                                }, 1400);
                                // twn?.stop()?.end()
                            }
                        })
                        .start();
                });
            }

            // Move the entity to a new bin
            if (entity.mesh.position.x !== crate.x || entity.mesh.position.y !== crate.y) {
                const bucketKey = getBucketKey(crate.x, crate.y);

                const oldBin = this.crateBins.get(entity.binKey);

                if (oldBin) {
                    oldBin.delete(crate.id.toString());
                }

                const newBin = this.crateBins.get(bucketKey);

                if (newBin) {
                    newBin.set(crate.id.toString(), entity);
                } else {
                    const newCrateBin = new Map([
                        [crate.id.toString(), entity],
                    ]);

                    this.crateBins.set(bucketKey, newCrateBin);
                }

                entity.binKey = bucketKey;
            }

            entity.mesh.position.set(crate.x, 0, crate.y);
            entity.updateMatrix();
            entity.iMesh && (entity.iMesh.instanceMatrix.needsUpdate = true);

            entity?.cta?.removeFromParent();

            if (isPlayer) {
                ++this.player.collectedCrates;
                LocalStorageController.setItem(LocalStorageKeys.CRATES_COLLECTED, this.player.collectedCrates.toString());
            }

            if (typeof crate.s == 'number') {
                const { id, x, y } = crate;

                entity.specialty = crate.s;
                set_crates(prev => {
                    return {
                        ...prev,
                        [id.toString()]: {
                            x: x / GAME_SIZE,
                            y: y / GAME_SIZE,
                            specialty: crate.s
                        },
                    }
                });
            }
        }
    }

    // #region HandleSocketClose
    private handleSocketClose() {
        this.onClose();
        this.update = () => { };
        clearInterval(this.intervalID);
        clearInterval(this.updateIntervalID);
        this.resetScene();
        // set_disconnected(true);
    }
}
