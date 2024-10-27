export const boundsFrag = () => /* glsl */`
// precision mediump float;

// Uniforms from the update loop
// Performance.now() value
uniform float time;
// Player position
uniform vec3 p_Pos;
// 
uniform float firstRatioBound;
// 
uniform float secondRatioBound;
// 
uniform float MAX_DIST;

// Variables from the Vertex Shader
varying vec2 pos;
varying vec2 uVu;

// A simple lerp function, no easing function
float lerp(float start, float end, float t) {
    return start * (1. - t) + end * t;
}

void main() {
    float alpha = 1.;

    // c will hold a value operated on by sin() but that is clamped between 0.0 and 1.0
    // The time / 1000.0 bit is what makes the gradient scroll
    float c = (sin(pos.x * 2. + time / 1000.) + 1.)/ 2.;

    // We change the alpha based on whether C is above or below 0.5
    if (c <= 0.5) {
        alpha = 0.34;
    } else {
        alpha = 0.52;
    }


    float dist = distance(uVu, p_Pos.xz);
    // float MAX_DIST = 0.0052;
    
    // Check if the pixel is within range
    if (dist > MAX_DIST) {
        alpha = 0.;
    } else {
        // Cache the old
        // float old_alpha = alpha;

        // Get a multiplier for how close the pixel is to player
        // Multiply that by the old alpha set from the check on c to get a radial gradient effect
        alpha = lerp(1., 0., dist / MAX_DIST) * alpha;
    }
    
    // This code makes sure the pixel is only rendered if it's beyond the edges of the game world
    if (uVu.x > firstRatioBound && uVu.x < secondRatioBound && uVu.y > firstRatioBound && uVu.y < secondRatioBound) {
        alpha = 0.0;
    }
    
    // Return pixel colour
    gl_FragColor = vec4(1., 0., 0., alpha);
}
`