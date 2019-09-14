precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform float time;
uniform mat4 world;
uniform mat4 worldViewProjection;

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

// Varying
varying vec3 vPositionW;

void main(void) {
    vec4 outPosition = worldViewProjection * vec4(position, 1.0);
    gl_Position = outPosition;
    vPositionW = vec3(world * vec4(position, 1.0));
}