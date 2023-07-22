attribute vec3 position;
attribute vec3 color;
varying vec4 vColor;

void main() {
  vColor = vec4(color, 1.0);

  gl_Position = vec4(position.x, position.y, position.z, 1.0);
}
