import { onCleanup, onMount } from "solid-js"
import { SAILS_CUSTOMIZATIONS } from "../customizations/sails"
import { CustomizationModalInnerItem } from "./CustomizationModalInnerItem"
import { SBShipPreviewer } from "../../../scenes/SBShipPreviewer"
import { game_over } from "../../../App"

interface ICustomizationModalInner {
    list: typeof SAILS_CUSTOMIZATIONS
    onSelect: (selectedKey: string | undefined) => void
    onHover: (selectedKey: string | undefined, isHover: boolean) => void
    selected: string | undefined
}

export const CustomizationModalInner = (props: ICustomizationModalInner) => {
    let previewContainer: HTMLDivElement | undefined;

    let previewer: ReturnType<typeof SBShipPreviewer>

    onMount(() => {
        try {
            previewer = SBShipPreviewer('ship-preview');
        } catch(err) {
            console.error(err);
        }

        onCleanup(() => {
            console.log('main meny clean up');
            previewer?.cleanup?.();
        });
    });
    
    return <div style={{
        display: 'grid',
        "grid-template-columns": game_over() ? '1fr 3fr' : '1fr',
        gap: '8px',
        // "justify-content": "space-between",
        // "align-items": 'center',
    }}>
        {game_over() && <div
            style={{
                position: 'sticky',
                top: '1px',
                width: '100%',
                height: 'fit-content',
                "min-width": 0,
                "min-height": 0,
            }}
            id="ship-previewer-wrapper"
        >
            <div id="ship-preview" style={{
                width: '100%',
                "aspect-ratio": '1 / 2',
            }} ref={previewContainer}></div>
        </div>}
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'grid',
                "grid-template-columns": 'repeat(5, 1fr)',
                "grid-template-rows": 'min-content',
                gap: '12px',
                "box-sizing": 'border-box',
                // display: 'flex',
                // "flex-wrap": 'wrap',
                // "justify-content": 'start',
                "align-items": 'start',
            }}>
            {/* <CustomizationModalInnerItem
            selected={!props.selected}
            icon={
                <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'white',
                    display: 'flex',
                    "justify-content": 'center',
                    "align-items": 'center',
                }}>
                    <svg width="43" height="43" viewBox="0 0 52 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.898259 8.88299L9.38354 0.39771L51.1028 42.117L42.6176 50.6023L0.898259 8.88299Z" fill="#E6E6E6" />
                        <path d="M9.38354 50.6023L0.898259 42.117L42.6176 0.39771L51.1028 8.88299L9.38354 50.6023Z" fill="#E6E6E6" />
                    </svg>
                </div>
            }
            name={"NONE"}
            onSelect={props.onSelect}
            onHover={props.onHover}
        /> */}
            {props.list.map(item => {
                return <CustomizationModalInnerItem
                    selected={item.name == props.selected}
                    icon={item.icon}
                    name={item.name}
                    unlocked={item.unlocked}
                    onSelect={props.onSelect}
                    onHover={props.onHover}
                />;
            })}
        </div>
    </div>
}
