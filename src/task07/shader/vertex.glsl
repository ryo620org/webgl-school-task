
attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
attribute vec2 texCoord; // テクスチャ座標 @@@
uniform mat4 mvpMatrix;
uniform mat4 normalMatrix;
varying vec4 vColor;
varying vec2 vTexCoord; // テクスチャ座標受け渡し用 @@@

// ライトベクトルはひとまず定数で定義する
const vec3 light = vec3(0.0, 1.0, 2.0);

void main() {
  // 法線を変換
  vec3 n = (normalMatrix * vec4(normal, 0.0)).xyz;

  // 変換した法線とライトベクトルで内積を取る
  float d = dot(normalize(n), normalize(light));

  // 裏面も見えてほしいので diffuse が 0.0 より大きくなる範囲を広げる
  d = d * 0.5 + 0.5;

  // 内積の結果を頂点カラーの RGB 成分に乗算する
  vColor = vec4(color.rgb * d, color.a);

  // テクスチャ座標をフラグメントシェーダに送る @@@
  vTexCoord = texCoord;

  // MVP 行列と頂点座標を乗算してから出力する
  gl_Position = mvpMatrix * vec4(position, 1.0);
}

