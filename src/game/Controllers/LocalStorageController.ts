import { CrazyGamesController } from "../commons/vendors/CrazyGamesController";

export class LocalStorageController {
    static getItem(name: string) {
        if (CrazyGamesController.getInstance()?.sdk) {
            return CrazyGamesController.getInstance().getItem(name);
        } else {
            return localStorage.getItem(name);
        }
    }
    static setItem(name: string, value: string) {
        if (CrazyGamesController.getInstance()?.sdk) {
            CrazyGamesController.getInstance().setItem(name, value);
        } else {
            localStorage.setItem(name, value);
        }
    }

    static clear() {
        if (CrazyGamesController.getInstance()?.sdk) {
            CrazyGamesController.getInstance().clear();
        } else {
            localStorage.clear();
        }
    }
}