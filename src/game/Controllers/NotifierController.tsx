import { JSXElement } from "solid-js";
import { set_notifs } from "../../App";

export interface Notif {
    content: JSXElement;
    title?: JSXElement;
    img?: JSXElement;
    type: NotificationType;
}

export class NotifierController {
    public static instance: NotifierController;

    public static getInstance() {
        if (this.instance) {
            return this.instance;
        } else {
            this.instance = new NotifierController();

            return this.instance;
        }
    }

    public static showInfoNotif(text: JSXElement, delay = 2000) {
        this.instance.addNotification(NotificationType.INFO, {
            content: <>{text}</>
        }, delay)
    }
    public static showUnlockNotif(text: JSXElement, title: JSXElement, img: JSXElement, delay = 2000) {
        this.instance.addNotification(NotificationType.UNLOCK, {
            content: <>{text}</>,
            title: <>{title}</>,
            img
        }, delay)
    }

    private constructor() { }

    notifications: Notif[] = [];
    currentlyActiveNotification: number | undefined

    addNotification(type: NotificationType, props: Omit<Notif, 'type'>, delay = 2000) {
        // if (this.currentlyActiveNotification) {
        // this.notifications.push({
        //     ...props,
        //     type,
        // });
        // } else {
        //     this.createNotif({
        //         ...props,
        //         type,
        //     })
        // }
        const id = performance.now().toString();

        set_notifs(prev => {
            return new Map([
                ...Array.from(prev),
                [
                    id,
                    {
                        ...props,
                        type
                    }
                ]
            ])
        });

        setTimeout(() => {
            set_notifs(prev => {
                const newVal = new Map(prev);

                newVal.delete(id);
                
                return newVal;
            });
        }, delay);
    }
}

export enum NotificationType {
    INFO,
    UNLOCK,
}
