import { SAIL_NAMES } from "../commons/customizations/sails";
import { LocalStorageKeys } from "../commons/enums/LocalStorageKeys";
import { LocalStorageController } from "./LocalStorageController";
import { NotificationType, NotifierController } from "./NotifierController";

export class SailsUnlockController {
    notifier: NotifierController;
    unlocked: Set<string> = new Set();

    private constructor() {
        this.notifier = NotifierController.getInstance();

        this.unlocked = new Set(JSON.parse(LocalStorageController.getItem(LocalStorageKeys.SAILS_UNLOCKS) || '[]'));
    }

    unlock(sail: SAIL_NAMES, reason?: string) {
        this.unlocked.add(sail);

        this.updateSails();

        this.notifier.addNotification(NotificationType.UNLOCK, {
            content: <>Unlocked new sail: <strong>{sail}</strong></>
        })
    }


}