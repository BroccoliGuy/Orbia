export const cloudsVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const cloudsFragment = /* glsl */ `
  uniform vec3 uSun;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.05;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec2 drift = vec2(uTime * 0.002, 0.0);
    float field = fbm(n.xy * 7.0 + drift) * 0.5 + fbm(n.yz * 6.0 - drift) * 0.5;
    float band = sqrt(max(0.0, 1.0 - n.y * n.y));
    float mask = smoothstep(0.52, 0.74, field) * smoothstep(0.0, 0.35, band);
    float sun = smoothstep(-0.2, 0.6, dot(normalize(vNormal), normalize(uSun)));
    float alpha = mask * (0.12 + 0.38 * sun);
    gl_FragColor = vec4(vec3(0.96, 0.98, 1.0), alpha);
  }
`;
