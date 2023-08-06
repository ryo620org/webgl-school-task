precision mediump float;

uniform sampler2D characterTextureUnit;
uniform sampler2D normalTextureUnit;
uniform mat4 normalMatrix;

varying vec2 vTexCoord;

// ライトベクトルはひとまず定数で定義する
const vec3 lightPosition = vec3(4.0, 1.0, 1.0);

void main() {
  vec4 characterTextureColor = texture2D(characterTextureUnit, vTexCoord);
  vec4 normalTextureColor = texture2D(normalTextureUnit, vTexCoord);

  vec3 n = (normalMatrix * normalTextureColor).xyz;
  
  float d = dot(normalize(n), normalize(lightPosition));

  gl_FragColor = vec4(characterTextureColor.rgb * d, characterTextureColor.a);
}

