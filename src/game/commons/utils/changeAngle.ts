import { Vector2 } from "three";

export const changeAngle = (azimuth: number, vec2: Vector2) => {
    const radius = vec2.length();
    
    vec2.x = Math.cos(azimuth) * radius;
    vec2.y = Math.sin(azimuth) * radius;

    return vec2;
};