import { Mesh, MeshBasicMaterial } from 'three';

export enum TextType {
    PICK_ME,
}

export const textMaterial = new MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
});

export const text_repo: { [key: string]: Mesh } = {};
