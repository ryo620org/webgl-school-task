precision mediump float;

uniform vec3 lightPosition;
uniform mat4 normalMatrix;
varying vec3 vNormal;
varying vec4 vColor;

void main() {
  vec3 n = (normalMatrix * vec4(vNormal, 0.0)).xyz;
  
  float d = dot(normalize(n), normalize(lightPosition));

  gl_FragColor = vec4(vColor.rgb * d, vColor.a);
}

