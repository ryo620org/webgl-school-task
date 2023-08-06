precision mediump float;

uniform sampler2D characterTextureUnit;
uniform sampler2D normalTextureUnit;

varying vec4 vColor;
varying vec2 vTexCoord;

void main() {
  vec4 characterTextureColor = texture2D(characterTextureUnit, vTexCoord);
  vec4 normalTextureColor = texture2D(normalTextureUnit, vTexCoord);

  gl_FragColor = vColor * characterTextureColor * normalTextureColor;
}

