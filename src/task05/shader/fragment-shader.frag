precision mediump float;

// 経過時間を uniform 変数として受け取る
uniform float time;

void main() {
  // 時間の経過からサイン波を作り、絶対値で点滅させるようにする @@@
  float r = abs(sin(time));
  float g = abs(cos(time));
  float b = abs(sin(time));
  // フラグメントの色
  gl_FragColor = vec4(r, g, b, 1.0);
}

