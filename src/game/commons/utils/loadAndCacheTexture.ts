import { Texture } from "three";
import { TEXTURE_NAMES, texture_repo } from "../../texture_repo";
import { loadTexture } from "./loadTexture";

export const loadAndCacheTexture = (url: string, key: TEXTURE_NAMES, onComplete = (texture: Texture) => texture) => {
    return loadTexture(url, texture => {
        texture_repo[key] = texture;

        return onComplete(texture);
    });
};