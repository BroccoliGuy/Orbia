export const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const atmosphereFragment = /* glsl */ `
  uniform vec3 uSun;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.6);
    float sun = smoothstep(-0.15, 0.65, dot(normalize(vNormal), normalize(uSun)));
    vec3 color = mix(vec3(0.15, 0.35, 0.7), vec3(0.45, 0.78, 1.0), sun);
    gl_FragColor = vec4(color, fresnel * (0.28 + 0.72 * sun) * 0.95);
  }
`;
