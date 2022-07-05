precision highp float;

// Lights
varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec4 vColor;
varying vec2 vUV;

// Refs
uniform sampler2D diffuseTexture;
uniform vec3 lightInvDirW;
uniform float roughness;
uniform vec3 viewPos;

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

    float f = ndl * ndl * (cos(30. * ndl) + 1.) * 0.5;
    if (f > roughness) {
        color = color * 0.25 + vec4(0.75);
    }
    else if (f > roughness * 0.5) {
        color = color * 0.5 + vec4(0.5);
    }

    vec3 viewDir = normalize(viewPos - vPositionW);
    vec3 reflectDir = reflect(lightInvDirW, vNormalW);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.);
    color += vec4(spec);
    
    gl_FragColor = vec4(color.rgb, a);
}