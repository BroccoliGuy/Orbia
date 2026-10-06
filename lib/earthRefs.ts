import type { BufferGeometry, DataTexture, ShaderMaterial } from "three";

export const HEAT_WIDTH = 1024;
export const HEAT_HEIGHT = 512;
export const heatPixels = new Uint8Array(HEAT_WIDTH * HEAT_HEIGHT * 4);

export const earthRefs: {
  geometry: BufferGeometry | null;
  material: ShaderMaterial | null;
  heat: DataTexture | null;
  heatEpoch: number;
} = {
  geometry: null,
  material: null,
  heat: null,
  heatEpoch: 0,
};
