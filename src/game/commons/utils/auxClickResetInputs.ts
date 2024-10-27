import { NetController } from "../../Controllers/NetController";

export const auxClickResetInputs = () => {
    if (NetController.instance) {
        NetController.instance.player.resetInputs();
    }
}