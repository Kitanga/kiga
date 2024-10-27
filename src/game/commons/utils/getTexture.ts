import { Texture, TextureLoader } from "three";

const textureLoader = new TextureLoader();

export const getTexture = async (url: string, onComplete = (texture: Texture) => texture) => {
    const texture = await textureLoader.loadAsync(`assets/img/${url}`);

    return onComplete(texture);
}
