import { LinearFilter, LinearMipmapLinearFilter, LinearMipmapNearestFilter, NearestFilter, NearestMipmapLinearFilter, NearestMipmapNearestFilter, RepeatWrapping, Texture } from "three";
import { TEXTURE_NAMES, texture_repo } from "../../texture_repo";
import { loadTexture } from "./loadTexture";
const WEBGL_FILTERS = {
    9728: NearestFilter,
    9729: LinearFilter,
    9984: NearestMipmapNearestFilter,
    9985: LinearMipmapNearestFilter,
    9986: NearestMipmapLinearFilter,
    9987: LinearMipmapLinearFilter
};

export const loadSailTexture = async (name: string, key: TEXTURE_NAMES, onComplete = (texture: Texture) => texture) => {
    await loadTexture(`${name}.png`, texture => {
        texture_repo[key] = texture;

        texture.flipY = false;

        texture.magFilter = WEBGL_FILTERS[9729] || LinearFilter;
        texture.minFilter = WEBGL_FILTERS[9987] || LinearMipmapLinearFilter;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;

        return onComplete(texture);
    });
}