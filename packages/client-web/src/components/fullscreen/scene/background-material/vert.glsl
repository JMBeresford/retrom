varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position =  vec4(position * 2.0, 1.0);
}
