import { Texture } from "three";
import { getTexture } from "./getTexture";

export const loadTexture = (url: string, onComplete = (texture: Texture) => texture) => {
    return getTexture(url, texture => {
        return onComplete(texture);
    });
};
