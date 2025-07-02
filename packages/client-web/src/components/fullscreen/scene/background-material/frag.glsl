#define GRID_SCALE 18.0

uniform float uTime;
uniform vec3 uColor;
uniform vec2 uResolution;

varying vec2 vUv;

#pragma glslify: cnoise3 = require('glsl-noise/classic/3d');
#pragma glslify: snoise3 = require('glsl-noise/simplex/3d');

struct Grid {
  vec2 st;
  vec2 id;
};

Grid getGrid(vec2 st, float scale) {
  vec2 gridSt = st / scale;
  vec2 coords = fract(gridSt) - 0.5;

  return Grid(coords, floor(gridSt));
}

void main() {
  float t = (uTime + 1000.0) * 0.25;

  vec2 st = gl_FragCoord.xy;
  vec2 stNormalized = st / uResolution;

  st.y -= t * 100.0;
  Grid grid = getGrid(st, GRID_SCALE);
  
  float yFade = smoothstep(1.2, 0.2, stNormalized.y);

  float noise1 = cnoise3(vec3(grid.id * 0.2, t ));
  float noise2 = snoise3(vec3((grid.id + noise1 * 7.0) * 0.1, t));
  float noise = noise1 + noise2;
  noise = noise * (0.9 - yFade * 0.7);
  noise = pow(1.0 + noise, 2.0) / 2.0;


  vec3 cellColor = uColor * yFade * 3.0;// - min(noise * yFade * 2.5, 1.0);
  cellColor = mix(cellColor, uColor * 0.075, noise);
  cellColor = pow(cellColor, vec3(max(1.0 + (1.0 - yFade) * 2.0, 1.0)));

  vec3 color = cellColor;

  // vignette
  vec2 correctedUv = vUv;
  float vignette = distance(vec2(0.5), correctedUv);
  vignette = smoothstep(0.75, 0.3, vignette);
  color *= vignette;

  gl_FragColor = vec4(color, length(color));

  #include <tonemapping_fragment>
}
