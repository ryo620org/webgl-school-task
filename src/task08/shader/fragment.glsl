precision mediump float;

uniform sampler2D textureUnit; // テクスチャ @@@

varying vec4 vColor;
varying vec2 vTexCoord; // テクスチャ座標 @@@

void main() {
  // テクスチャから、テクスチャ座標の位置の色を取り出す @@@
  // ※フラグメントシェーダはピクセルの単位で動作していることを念頭に
  vec4 textureColor = texture2D(textureUnit, vTexCoord);

  gl_FragColor = vColor * textureColor;
}

