export const earthVertex = /* glsl */ `
  uniform sampler2D uElevation;
  uniform sampler2D uBathymetry;
  uniform float uDisplacement;
  uniform float uSea;
  uniform float uEverest;
  uniform float uDepthScale;
  uniform float uMorph;
  attribute vec3 aProj;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;

  void main() {
    vec3 n = normalize(normal);
    float elev = texture2D(uElevation, uv).r;
    float depth = texture2D(uBathymetry, uv).r;
    float land = (elev - uSea) / max(uEverest - uSea, 0.0001);
    float ocean = -depth * uDepthScale;
    float height = (elev < uSea ? ocean : land) * uDisplacement;
    vec3 sph = position + n * height;
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
  uniform sampler2D uDetailDay;
  uniform sampler2D uDetailNight;
  uniform sampler2D uElevation;
  uniform sampler2D uHeat;
  uniform vec4 uDetailBounds;
  uniform vec3 uSun;
  uniform float uNightLights;
  uniform float uDetailMix;
  uniform float uLowPoly;
  uniform float uHeatMix;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;

  void main() {
    vec3 sun = normalize(uSun);
    vec3 smoothN = normalize(vNormal);
    vec3 terrainN = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    if (dot(terrainN, smoothN) < 0.0) terrainN = -terrainN;
    float sphereLight = dot(smoothN, sun);
    float terrainLight = dot(terrainN, sun);
    float light = mix(sphereLight, terrainLight, uLowPoly);
    float dayFactor = smoothstep(-0.15, 0.28, sphereLight);
    vec3 dayCol = texture2D(uDay, vUv).rgb;
    vec3 nightSample = texture2D(uNight, vUv).rgb;
    vec2 detailSpan = max(uDetailBounds.zw - uDetailBounds.xy, vec2(0.00001));
    vec2 detailUv = (vUv - uDetailBounds.xy) / detailSpan;
    float inside = step(uDetailBounds.x, vUv.x) * step(vUv.x, uDetailBounds.z) * step(uDetailBounds.y, vUv.y) * step(vUv.y, uDetailBounds.w);
    float detail = inside * uDetailMix;
    dayCol = mix(dayCol, texture2D(uDetailDay, detailUv).rgb, detail);
    nightSample = mix(nightSample, texture2D(uDetailNight, detailUv).rgb, detail);
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
    float shade = mix(0.62, 1.0, clamp(mix(sphereLight, terrainLight, uLowPoly), 0.0, 1.0));
    color *= mix(1.0, shade, dayFactor * (1.0 - uLowPoly));
    gl_FragColor = vec4(color, 1.0);
  }
`;
