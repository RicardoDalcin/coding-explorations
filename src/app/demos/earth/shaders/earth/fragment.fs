precision mediump float;

// uniform vec3 color;

varying float normalizedHeight;
varying float height;
// varying float temperature;
varying float snow;

void main()
{
  vec3 oceanColor = vec3(0.0, 0.0, 0.5);
  vec3 sandColor = vec3(1.0, 1.0, 0.5);
  vec3 grassColor = vec3(0.0, 1.0, 0.0);
  vec3 rockColor = vec3(0.5, 0.5, 0.5);
  vec3 snowColor = vec3(1.0, 1.0, 1.0);

  float oceanLevel = 0.0;
  float sandLevel = 0.2;
  float grassLevel = 0.3;
  float rockLevel = 0.85;
  float snowLevel = 0.9;

  vec3 color = oceanColor;

  if (normalizedHeight >= sandLevel) {
    color = sandColor;
  }

  if (normalizedHeight >= grassLevel) {
    // if (snow > 0.8) {
    //   color = vec3(1.0, 1.0, 1.0);
    // } else if (snow > 0.5) {
    //   color = vec3(0.7, 0.7, 0.9);
    // } else if (snow > 0.3) {
    //   color = vec3(0.5, 0.5, 0.7);
    // } else {
    color = grassColor;
    // }
  }

  if (normalizedHeight >= rockLevel) {
    color = rockColor;
  }

  if (normalizedHeight >= snowLevel) {
    color = snowColor;
  }

  gl_FragColor = vec4(color, 1.0);

  // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);

  // gl_FragColor = vec4(normalizedHeight, normalizedHeight, normalizedHeight, 1.0);
}