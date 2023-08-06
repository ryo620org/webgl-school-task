
attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;

uniform mat4 mvpMatrix;

varying vec3 vNormal;
varying vec4 vColor;

void main() {
  vNormal = normal;
  vColor = color;

  gl_Position = mvpMatrix * vec4(position, 1.0);
}

