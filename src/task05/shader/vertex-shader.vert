attribute vec3 position;
attribute vec3 color;
varying vec4 vColor;

void main() {
  // 頂点属性として受け取った color を fragment shader に渡す
  vColor = vec4(color, 1.0);

  gl_Position = vec4(position, 1.0);
}
