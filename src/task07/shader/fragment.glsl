precision mediump float;

uniform sampler2D characterTextureUnit;
uniform sampler2D normalTextureUnit;
uniform mat4 invMatrix;
uniform vec3 lightPosition;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vTexCoord;

void main() {
  vec4 characterTextureColor = texture2D(characterTextureUnit, vTexCoord);
  vec4 normalTextureColor = texture2D(normalTextureUnit, vTexCoord);
  vec3 normal = vec3(normalTextureColor.r * 2.0 - 1.0, normalTextureColor.g * 2.0 - 1.0, normalTextureColor.b);

  // ライトベクトル = ライト位置 - フラグメント位置
  vec3 lightVector = lightPosition - vPosition;
  // ライトの距離
  float distance = distance(lightPosition, vPosition);
  // 減衰率
  float maxDistance = 5.0;
  float attenuationRate = (maxDistance - distance) / maxDistance;

  // 法線の変換（ノーマルマップカラーに逆転置行列をかける）
  vec3 invNormal = (invMatrix * vec4(normal.rgb, 0.0)).xyz;
  
  // 内積を算出（= 光の影響度 -1~1）
  float d = dot(normalize(invNormal), normalize(lightVector));

  gl_FragColor = vec4(vColor.rgb * characterTextureColor.rgb * d * attenuationRate, characterTextureColor.a);
}

