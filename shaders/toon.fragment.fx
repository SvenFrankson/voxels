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
    float ToonThresholds[5];
    ToonThresholds[0] = 0.8;
    ToonThresholds[1] = 0.6;
    ToonThresholds[2] = 0.4;
    ToonThresholds[3] = 0.1;
    ToonThresholds[4] = - 0.4;

    float ToonBrightnessLevels[6];
    ToonBrightnessLevels[0] = 1.0;
    ToonBrightnessLevels[1] = 0.84;
    ToonBrightnessLevels[2] = 0.68;
    ToonBrightnessLevels[3] = 0.52;
    ToonBrightnessLevels[4] = 0.36;
    ToonBrightnessLevels[5] = 0.2;

    // diffuse
    float ndl = dot(vNormalW, lightInvDirW);

    vec3 color = colDirt;
    if (vNormalW.y > 0.6) {
        color = colGrass;
    }
    float d = vColor.r;
    float dRock = vColor.g;
    float dSand = vColor.b;
    if (dRock > d) {
        d = dRock;
        if (vNormalW.y < 0.7) {
            color = colRock * 0.9;
        }
        else {
            color = colRock * 1.1;
        }
    }
    if (dSand > d) {
        d = dSand;
        color = colSand;
        if (vNormalW.y < 0.7) {
            color = colSand * 0.9;
        }
        else {
            color = colSand * 1.1;
        }
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
    else if (ndl > ToonThresholds[4])
    {
        color *= ToonBrightnessLevels[4];
    }
    else
    {
        color *= ToonBrightnessLevels[5];
    }

    /*
    if (abs(vPositionW.x - round(vPositionW.x)) < 0.005) {
        color = vec3(0.);
    }
    if (abs(vPositionW.z - round(vPositionW.z)) < 0.005) {
        color = vec3(0.);
    }
    */
    
    gl_FragColor = vec4(color, 1.);
}