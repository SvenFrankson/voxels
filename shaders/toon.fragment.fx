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

    float ndl = dot(vNormalW, lightInvDirW);

    float alpha = vColor.a;

    // diffuse
    vec4 color = vColor * texture2D(diffuseTexture, vUV);

    float lightningFactor = 1.;
    if (ndl > ToonThresholds[0])
    {
        lightningFactor = ToonBrightnessLevels[0];
    }
    else if (ndl > ToonThresholds[1])
    {
        lightningFactor = ToonBrightnessLevels[1];
    }
    else if (ndl > ToonThresholds[2])
    {
        lightningFactor = ToonBrightnessLevels[2];
    }
    else if (ndl > ToonThresholds[3])
    {
        lightningFactor = ToonBrightnessLevels[3];
    }
    else if (ndl > ToonThresholds[4])
    {
        lightningFactor = ToonBrightnessLevels[4];
    }
    else
    {
        lightningFactor = ToonBrightnessLevels[5];
    }

    // specular
    vec3 viewDir = normalize(viewPos - vPositionW);
    vec3 reflectDir = reflect(lightInvDirW, vNormalW);
    float specularFactor = 10. * (1. - roughness) * pow(max(dot(viewDir, reflectDir), 0.0), 32.) + 1.;
    specularFactor = floor(specularFactor * 1.) / 1.;

    // reflection
    float reflectionFactor = 10. * (1. - roughness) * (ndl * ndl * (cos(30. * ndl) + 1.) * 0.5) + 1.;
    reflectionFactor = floor(reflectionFactor * 1.) / 1.;
    
    float f = lightningFactor * specularFactor * reflectionFactor;

    gl_FragColor = vec4(color.rgb * f, alpha);
}