export const earthVertex = /* glsl */ `
  uniform sampler2D uElevation;
  uniform float uDisplacement;
  uniform float uMorph;
  attribute vec3 aProj;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;

  void main() {
    vec3 n = normalize(normal);
    float elev = texture2D(uElevation, uv).r;
    vec3 sph = position + n * ((elev - 0.42) * uDisplacement);
    vec3 pos = mix(sph, aProj, uMorph);
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * n);
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const earthFragment = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uElevation;
  uniform sampler2D uHeat;
  uniform vec3 uSun;
  uniform float uNightLights;
  uniform float uLowPoly;
  uniform float uHeatMix;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;

  void main() {
    vec3 sun = normalize(uSun);
    vec3 smoothN = normalize(vNormal);
    vec3 flatN = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    float light = mix(dot(smoothN, sun), dot(flatN, sun), uLowPoly);
    float dayFactor = smoothstep(-0.15, 0.28, light);
    vec3 dayCol = texture2D(uDay, vUv).rgb;
    vec3 nightSample = texture2D(uNight, vUv).rgb;
    vec3 nightCol = nightSample * mix(0.16, 1.85, uNightLights) + vec3(0.015, 0.03, 0.055);
    float land = smoothstep(0.40, 0.50, texture2D(uElevation, vUv).r);
    vec3 lowOcean = vec3(0.04, 0.16, 0.34);
    vec3 lowLand = mix(vec3(0.16, 0.38, 0.24), vec3(0.45, 0.38, 0.22), smoothstep(0.55, 0.75, texture2D(uElevation, vUv).r));
    vec3 low = mix(lowOcean, lowLand, land);
    low *= 0.28 + 0.72 * clamp(light * 0.5 + 0.5, 0.0, 1.0);
    vec3 color = mix(nightCol, dayCol, dayFactor);
    color = mix(color, low, uLowPoly);
    vec4 heat = texture2D(uHeat, vUv);
    float heatMask = max(heat.a, step(0.15, max(heat.r, max(heat.g, heat.b))));
    color = mix(color, mix(color, heat.rgb, 0.82), uHeatMix * heatMask);
    float shade = mix(1.0, 0.55 + 0.45 * clamp(light, 0.0, 1.0), 0.35);
    gl_FragColor = vec4(color * mix(1.0, shade, 1.0 - uLowPoly * 0.5), 1.0);
  }
`;
