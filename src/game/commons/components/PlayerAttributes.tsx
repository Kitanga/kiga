import { JSX } from "solid-js/jsx-runtime";
import { damage_attr, health_attr, range_attr, reload_time_attr, speed_attr, turn_speed_attr, upgrades, user_level, user_xp, username } from "../../../App";
import { ATTRIBUTES_NAME, EXP_GAIN_CRATE, EXP_GAIN_ELIMINATION, EXP_MAX_PER_LEVEL, EXP_NEEDED_TO_LEVEL_UP, LEVEL_UP_REQ } from "../../constants";
import { SHIP_SCALES } from "../../ship_repo";
import { DamageIconSVG } from "../icons/DamageIconSVG";
import { HealthIconSVG } from "../icons/HealthIconSVG";
import { RangeIconSVG } from "../icons/RangeIconSVG";
import { ReloadTimeIconSVG } from "../icons/ReloadTimeIconSVG";
import { SpeedIconSVG } from "../icons/SpeedIconSVG";
import { TurnSpeedIconSVG } from "../icons/TurnSpeedIconSVG";
import { SpecialtyItem } from "./SpecialtyItem";
import playerAttrStyles from "./css/PlayerAttributes.module.css";

// export const PlayerAttributes
export const PlayerAttributes = () => {

    return <div class={playerAttrStyles.wrapper}>
        <header class={playerAttrStyles.header}>
            <div style={{
                width: '100%',
                display: 'flex',
                "justify-content": 'space-between',
            }}>
                <div
                    style={{
                        width: '100%',
                        "text-overflow": 'ellipsis',
                        overflow: 'hidden',
                    }}>{username()}</div>
                <div class={[playerAttrStyles.level, user_level() == EXP_NEEDED_TO_LEVEL_UP.length + 1 ? playerAttrStyles.levelMax : ''].join(' ')}>{user_level()}</div>
            </div>
            <div style={{
                "font-size": '10px',
                color: 'var(--lightblue)',
                "text-align": 'right',
            }}>
                {user_level() <= LEVEL_UP_REQ.length &&
                    // @ts-ignore
                    function () {
                        const level = user_level();
                        const xp = user_xp();

                        if (level != LEVEL_UP_REQ.length + 1) {
                            const cratesNeeded = Math.ceil((EXP_MAX_PER_LEVEL[level] - xp) / EXP_GAIN_CRATE);
                            const killsNeeded = Math.ceil((EXP_MAX_PER_LEVEL[level] - xp) / EXP_GAIN_ELIMINATION);
                            // const cratesNeeded = Math.ceil((EXP_MAX_PER_LEVEL[level] - xp) / EXP_GAIN_UPGRADE_CRATE);

                            if (cratesNeeded == killsNeeded) {
                                return (<>{`${cratesNeeded} ${cratesNeeded == 1 ? 'crate' : 'crates'}/${killsNeeded == 1 ? 'kill' : 'kills'} to level up`}</>) as JSX.Element
                            } else {
                                return (<>{`${cratesNeeded} ${cratesNeeded == 1 ? 'crate' : 'crates'}/${killsNeeded} ${killsNeeded == 1 ? 'kill' : 'kills'} to level up`}</>) as JSX.Element
                            }
                        } else {
                            return <></>;
                        }
                    } as any
                }
            </div>
        </header>

        <div style={{
            "margin-top": '8px',
            display: 'flex',
            gap: '8px',
        }}>
            {upgrades()?.map(upgrade => {
                return <SpecialtyItem upgrade={upgrade} />
            })}
        </div>

        <div
            style={{
                "margin-top": '7px',
                display: 'grid',
                gap: '3px',

            }}>
            {[
                {
                    label: ATTRIBUTES_NAME.HEALTH,
                    value: Math.round(health_attr()),
                    prefix: '+',
                    icon: <HealthIconSVG />,
                    highlight: health_attr() > 0,
                },
                {
                    label: ATTRIBUTES_NAME.DAMAGE,
                    value: Math.round(damage_attr()),
                    prefix: '+',
                    icon: <DamageIconSVG />,
                    highlight: damage_attr() > 0,
                },
                {
                    label: ATTRIBUTES_NAME.SPEED,
                    value: (speed_attr()).toFixed(2).replace('.00', ''),
                    prefix: '+',
                    icon: <SpeedIconSVG />,
                    highlight: speed_attr() > 0,
                },
                {
                    label: ATTRIBUTES_NAME.TURN_SPEED,
                    value: (turn_speed_attr()).toFixed(2).replace('.00', ''),
                    prefix: '+',
                    icon: <TurnSpeedIconSVG />,
                    highlight: turn_speed_attr() > 0,
                },
                {
                    label: ATTRIBUTES_NAME.RANGE,
                    value: ((range_attr()) * SHIP_SCALES.BASIC_1).toFixed(2).replace('.00', ''),
                    prefix: '+',
                    icon: <RangeIconSVG />,
                    highlight: range_attr() > 0,
                },
                {
                    label: ATTRIBUTES_NAME.RELOAD_TIME,
                    value: ((-reload_time_attr()) / 1000).toFixed(2).replace('.00', ''),
                    prefix: '',
                    icon: <ReloadTimeIconSVG />,
                    highlight: reload_time_attr() > 0,
                },
            ].map(({ label, value, icon, highlight, prefix }) => {
                return (
                    <div style={{
                        display: 'flex',
                        "justify-content": 'space-between',
                        "align-items": 'center',
                        "font-size": '10px',
                        background: 'var(--attr-bg)',
                        padding: '3px 14px',
                        "border-radius": '50px',
                        height: '34px',
                        "box-sizing": 'border-box'
                    }}>
                        <div style={{
                            display: 'flex',
                            "align-items": 'center',
                            "text-transform": 'capitalize',
                            gap: '8px',
                        }}>
                            {icon}
                            {label + ' Bonus'}
                        </div>
                        <div
                            style={{
                                // "text-decoration": highlight ? 'underline' : '',
                            }}>
                            {value != 0 ? prefix : ''}{value}
                        </div>
                    </div>
                )
            })}
        </div>
    </div>;
};