precision highp float;

// Lights
varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec4 vColor;
varying vec2 vUV;

// Refs
uniform sampler2D diffuseTexture;
uniform vec3 lightInvDirW;

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

    float a = vColor.a;
    vec4 color = vColor * texture2D(diffuseTexture, vUV);

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
    
    gl_FragColor = vec4(color.rgb, a);
}