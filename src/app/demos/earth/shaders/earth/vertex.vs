uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform sampler2D uDisplacementMap;
uniform float uDisplacementScale;
uniform sampler2D uTemperatureMap;
uniform sampler2D uSnowMap;

attribute vec2 uv;
attribute vec3 position;
attribute vec3 normal;

varying float normalizedHeight;
varying float height;
varying float temperature;
varying float snow;

void main() {
  normalizedHeight = 1.0 - texture2D(uDisplacementMap, uv).r;
  height = normalizedHeight * uDisplacementScale;

  vec4 position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  position.y += height;

  temperature = texture2D(uTemperatureMap, uv).r;
  snow = texture2D(uSnowMap, uv).r;

  gl_Position = position;
}