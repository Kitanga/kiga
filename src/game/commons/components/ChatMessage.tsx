import { onMount } from "solid-js"

export const ChatMessage = ({ autofocus, message, id }: { autofocus?: boolean, message: any, id: number }) => {
    onMount(() => {
        if (autofocus) {
            setTimeout(() => {
                const msgDiv = document.getElementById(id.toString());

                if (msgDiv) {
                    // msgDiv.scrollIntoView();
                    const msgList = document.getElementById('messages-list-sunbaked') as HTMLDivElement;

                    if (msgList) {
                        msgList.scrollTop = msgDiv.offsetTop;
                    }
                }
            }, 0);
        }
    });

    return <div
        id={id.toString()}
        style={{
            "margin-bottom": '4px',
            "max-width": '100%',
            "word-wrap": 'break-word',
            "font-size": '14px',
        }}
    >
        <span style={{
            "text-decoration": 'underline',
        }}>{message.user == '___You___' ? 'YOU' : message.user}</span>: {message.content}
    </div>
}