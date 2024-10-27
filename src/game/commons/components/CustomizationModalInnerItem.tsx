import { createEffect, JSXElement } from "solid-js";
import { is_mobile, mute } from "../../../App";

export const CustomizationModalInnerItem = (props: { name?: string, icon: JSXElement, unlocked?: boolean, onSelect: (selectedKey: string | undefined) => void, onHover: (selectedKey: string | undefined, isHover: boolean) => void, selected: boolean }) => {
    /** @type {HTMLAudioElement} */
    const switchAud = document.getElementById('switch-aud') as HTMLAudioElement;

    switchAud.volume = 0.07;
    switchAud.muted = mute();

    createEffect(() => {
        switchAud.muted = mute();
    });

    function playButtonSnd(volume = 0.07) {
        switchAud.muted = mute();
        switchAud.volume = volume;
        switchAud.currentTime = 0;
        switchAud.play();
    }

    function onMouseEnter(ev: any) {
        ev.currentTarget.style.background = props.selected ? 'var(--green)' : 'var(--khaki)';
        props?.onHover?.(props.name, true);
        playButtonSnd(0.01);
    }

    function onMouseLeave(ev: any) {
        ev.currentTarget.style.background = props.selected ? 'var(--green)' : '';
        props?.onHover?.(props.name, false);
    }

    return <div style={{
        display: 'flex',
        "justify-content": 'start',
        "align-items": 'center',
        "flex-direction": 'column',
        gap: '8px',
        "min-width": '0',
        "min-height": '0',
        width: '100%',
        // height: '100%',
        padding: '12px',
        "box-sizing": 'border-box',
        cursor: 'pointer',
        background: props.selected ? 'var(--green)' : '',
        position: 'relative',
    }}
        onClick={() => {
            playButtonSnd();
            props.onSelect(props.name);
        }}
        onPointerEnter={onMouseEnter}
        onPointerLeave={onMouseLeave}
    >
        <div
            style={{
                width: '100%',
                "aspect-ratio": '1',
            }}
        >
            {props.icon}
        </div>
        <div style={{
            "text-transform": 'uppercase',
            color: props.selected ? 'var(--black)' : 'var(--black)',
            "text-align": 'center',
            "font-size": is_mobile() ? '7px' : '10px',
        }}>{props.name || 'None'}</div>
        {(props.unlocked ?? false) || props.selected ? <></> : <div style={{
            padding: '2px',
            position: 'absolute',
            top: 0,
            left: 0,
            "z-index": 10,
            background: 'var(--green)',
            color: 'var(--black)',
            "font-size": '8px',
        }}>
            AD
        </div>}
    </div>
}