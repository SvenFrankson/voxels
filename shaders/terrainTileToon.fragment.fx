precision highp float;

// Lights
varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec2 vUV;

// Refs
uniform sampler2D diffuseTexture;
uniform sampler2D toonRampTexture;
uniform vec3 lightInvDirW;

void main(void) {
    // diffuse
    float ndl = dot(vNormalW, lightInvDirW) + 1.0;
    ndl *= 0.5;
    vec3 color = texture2D(diffuseTexture, vUV).rgb;
    float light = texture2D(toonRampTexture, vec2(ndl, 0.5)).r;
    
    gl_FragColor = vec4(color * light, 1.);
}