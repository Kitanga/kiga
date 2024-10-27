import { JSXElement, createEffect } from "solid-js"
import { is_mobile, mute } from "../../../App";

export const CustomizationItem = (props: { name: string, current?: JSXElement, onClick: (ev: MouseEvent) => void }) => {
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

    return <div
        style={{
            display: 'inline-flex',
            "flex-direction": 'column',
            "align-items": 'center',
            cursor: 'pointer',
        }}
        onClick={ev => {
            playButtonSnd();
            props?.onClick?.(ev);
        }}
        onMouseEnter={() => {
            playButtonSnd(0.01);
        }}
    >
        <div
            style={{
                "text-transform": 'uppercase',
                background: 'var(--yellow)',
                color: 'var(--black)',
                display: 'inline-block',
                padding: '4px 4px',
                "font-size": is_mobile() ? '7px' : '',
            }}
        >
            Active {props.name}
        </div>
        <div
            style={{
                width: is_mobile() ? '68px' : '121px',
                height: is_mobile() ? '68px' : '121px',
                background: 'var(--khaki)',
            }}
        >
            {!props.current && <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                "justify-content": 'center',
                "align-items": 'center'
            }}>
                <svg width="52" height="51" viewBox="0 0 52 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.898259 8.88299L9.38354 0.39771L51.1028 42.117L42.6176 50.6023L0.898259 8.88299Z" fill="var(--grey)" />
                    <path d="M9.38354 50.6023L0.898259 42.117L42.6176 0.39771L51.1028 8.88299L9.38354 50.6023Z" fill="var(--grey)" />
                </svg>
            </div>
            }
            {props.current}
        </div>
        <div
            style={{
                "text-transform": 'uppercase',
                background: 'var(--black)',
                color: 'var(--white)',
                padding: is_mobile() ? '2px' : '7px 7px',
                "font-size": is_mobile() ? '7px' : '',
            }}
        >
            Change
        </div>
    </div>
}