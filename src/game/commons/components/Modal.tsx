import { game_over, is_mobile } from "../../../App"

export const Modal = ({
    onClose,
    onOpen = () => { },
    children,
    title,
}: {
    children?: any
    onClose: () => void
    onOpen?: () => void
    title?: string
}) => {

    onOpen();

    return <div
        style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            "z-index": '10000',
        }}
    >
        {/* Closer */}
        <div
            style={{
                width: '100vw',
                height: '100vh',
                cursor: 'pointer',
            }}
            onClick={onClose}
        ></div>

        {/* Content wrapper */}
        <div
            style={{
                width: '100%',
                height: '100%',
                background: '#00000070',
                "backdrop-filter": game_over() ? 'blur(7px)' : '',
                position: 'absolute',
                top: 0,
                left: 0,
                "pointer-events": 'none',
                display: 'flex',
                "flex-direction": 'column',
                "justify-content": is_mobile() && !(window as any).PORTRAIT_ORIENTATION ? 'start' : 'center',
                "align-items": 'end',
                "padding-top": is_mobile() ? '16px' : '',
            }}
        >
            <div
                style={{
                    width: game_over() ? ((window as any).PORTRAIT_ORIENTATION ? '100vw' : '59vw') : ((window as any).PORTRAIT_ORIENTATION ? '100vw' : '34vw'),
                    "min-height": '34vh',
                }}
            >
                {title && <div
                    style={{
                        background: 'var(--black)',
                        color: 'var(--white)',
                        "font-size": '34px',
                        "font-weight": 700,
                        padding: '10px',
                        display: 'inline-block',
                        "margin-bottom": '14px',
                    }}
                >
                    {title}
                </div>}
                <div style={{
                    padding: '16px',
                    background: 'var(--white)',
                    color: 'var(--black)',
                    "pointer-events": 'all',
                    "max-height": is_mobile() ? '43vh' : '59vh',
                    overflow: 'scroll',
                    "overflow-x": 'hidden',
                }}>
                    {children}
                </div>
            </div>
        </div>
    </div>
}