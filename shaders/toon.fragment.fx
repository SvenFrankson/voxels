precision highp float;

// Lights
varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec3 vColor;
varying vec2 vUV;

// Refs
uniform sampler2D textureSampler;
uniform vec3 lightInvDirW;

uniform vec3 colGrass;
uniform vec3 colDirt;
uniform vec3 colRock;
uniform vec3 colSand;

void main(void) {
    float ToonThresholds[4];
    ToonThresholds[0] = 0.99;
    ToonThresholds[1] = 0.7;
    ToonThresholds[2] = 0.4;
    ToonThresholds[3] = 0.1;

    float ToonBrightnessLevels[5];
    ToonBrightnessLevels[0] = 1.0;
    ToonBrightnessLevels[1] = 0.8;
    ToonBrightnessLevels[2] = 0.6;
    ToonBrightnessLevels[3] = 0.35;
    ToonBrightnessLevels[4] = 0.2;

    // diffuse
    float ndl = max(0., dot(vNormalW, lightInvDirW));

    vec3 color = colDirt;
    if (vNormalW.y > 0.5) {
        color = colGrass;
    }
    float d = vColor.r;
    float dRock = vColor.g;
    float dSand = vColor.b;
    if (dRock > d) {
        d = dRock;
        color = colRock;
    }
    if (dSand > d) {
        d = dSand;
        color = colSand;
    }

    if (ndl > ToonThresholds[0])
    {
        color *= ToonBrightnessLevels[0];
    }
    else if (ndl > ToonThresholds[1])
    {
        color *= ToonBrightnessLevels[1];
    }
    else if (ndl > ToonThresholds[2])
    {
        color *= ToonBrightnessLevels[2];
    }
    else if (ndl > ToonThresholds[3])
    {
        color *= ToonBrightnessLevels[3];
    }
    else
    {
        color *= ToonBrightnessLevels[4];
    }

    gl_FragColor = vec4(color, 1.);
}