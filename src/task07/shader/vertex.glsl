
attribute vec3 position;
attribute vec4 color;
attribute vec2 texCoord;

uniform mat4 mvpMatrix;
uniform mat4 mMatrix;

varying vec3 vPosition;
varying vec4 vColor;
varying vec2 vTexCoord;

void main() {
  vPosition = (mMatrix * vec4(position, 1.0)).xyz;
  vColor = color;
  vTexCoord = texCoord;

  gl_Position = mvpMatrix * vec4(position, 1.0);
}

