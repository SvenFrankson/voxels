precision highp float;

// Lights
varying vec3 vPositionW;

// Refs
uniform vec2 dir0;
uniform vec2 dir1;
uniform vec2 dir2;
uniform vec2 dir3;
uniform vec2 dir4;
uniform vec2 dir5;
uniform vec2 dir6;

uniform float a0;
uniform float a1;
uniform float a2;
uniform float a3;
uniform float a4;
uniform float a5;
uniform float a6;

uniform float time;

void main(void) {

    float s0 = 11.;
    float s1 = 9.;
    float s2 = 7.;
    float s3 = 5.;
    float s4 = 3.;
    float s5 = 2.;
    float s6 = 1.;

    float ps0 = 4.;
    float k0 = 2. * 3.14 / ps0;

    float ps1 = 6.;
    float k1 = 2. * 3.14 / ps1;

    float ps2 = 8.;
    float k2 = 2. * 3.14 / ps2;

    float ps3 = 10.;
    float k3 = 2. * 3.14 / ps3;

    float ps4 = 12.;
    float k4 = 2. * 3.14 / ps4;

    float ps5 = 14.;
    float k5 = 2. * 3.14 / ps4;

    float ps6 = 16.;
    float k6 = 2. * 3.14 / ps4;

    float d0 = dot(vec2(vPositionW.x, vPositionW.z), dir0);
    float v0 = sin((d0 + time * s0 / 5.) * k0) * a0;

    float d1 = dot(vec2(vPositionW.x, vPositionW.z), dir1);
    float v1 = sin((d1 + time * s1 / 5.) * k1) * a1;

    float d2 = dot(vec2(vPositionW.x, vPositionW.z), dir2);
    float v2 = sin((d2 + time * s2 / 5.) * k2) * a2;

    float d3 = dot(vec2(vPositionW.x, vPositionW.z), dir3);
    float v3 = sin((d3 + time * s3 / 5.) * k3) * a3;

    float d4 = dot(vec2(vPositionW.x, vPositionW.z), dir4);
    float v4 = sin((d4 + time * s4 / 5.) * k4) * a4;

    float d5 = dot(vec2(vPositionW.x, vPositionW.z), dir5);
    float v5 = sin((d5 + time * s5 / 5.) * k5) * a5;

    float d6 = dot(vec2(vPositionW.x, vPositionW.z), dir6);
    float v6 = sin((d6 + time * s6 / 5.) * k6) * a6;

    float c0 = (v0 + v1 + v2 + v3 + v4 + v5 + v6);
    float c1 = (-v0 + v1 + -v2 + v3 + -v4 + v5 + v6);

    float h0 = sin(6.28 * time / 10.) / 4.;
    float h1 = cos(6.28 * time / 10.) / 4.;

    vec4 color = vec4(0., 0., 0., 0.);

    if (abs(c0 + h0) < 0.03) {
        color = vec4(0.75, 0.75, 0.75, 1.);
    } else if (abs(c1 + h1) < 0.03) {
        color = vec4(0.5, 0.5, 0.5, 1.);
    }

    gl_FragColor = color;
}