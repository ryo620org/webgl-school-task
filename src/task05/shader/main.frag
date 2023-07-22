precision mediump float;
uniform float time;
varying vec4 vColor;

void main() {
  // 時間をsin()に入れ、頂点の色にかける（オリジナルの頂点色〜黒を行き来するようになる）
  vec3 rgb = vColor.rgb * abs(sin(time));

  gl_FragColor = vec4(rgb, vColor.a);
}

