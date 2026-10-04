import { mesh } from "topojson-client";
import type { Topology } from "topojson-specification";

function toVector(lat: number, lon: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((90 - lon) * Math.PI) / 180;
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

const scope = self as unknown as {
  addEventListener(
    type: "message",
    listener: (event: MessageEvent<{ url: string; mode: "borders" | "coasts" }>) => void,
  ): void;
  postMessage(message: unknown, transfer: Transferable[]): void;
};

scope.addEventListener("message", async (event: MessageEvent<{ url: string; mode: "borders" | "coasts" }>) => {
  const response = await fetch(event.data.url);
  const topology = (await response.json()) as Topology;
  const objectName = event.data.mode === "coasts" ? "land" : "countries";
  const object = topology.objects[objectName];
  const lined = mesh(
    topology,
    object as never,
    event.data.mode === "borders" ? (((a: unknown, b: unknown) => a !== b) as never) : undefined,
  );
  const positions: number[] = [];
  const lines = (lined.type === "MultiLineString" ? lined.coordinates : [lined.coordinates]) as number[][][];
  for (const line of lines) {
    for (let index = 1; index < line.length; index += 1) {
      const [lonA, latA] = line[index - 1];
      const [lonB, latB] = line[index];
      if (Math.abs(lonA - lonB) > 8) continue;
      const a = toVector(latA, lonA, event.data.mode === "coasts" ? 1.003 : 1.005);
      const b = toVector(latB, lonB, event.data.mode === "coasts" ? 1.003 : 1.005);
      positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    }
  }
  const buffer = new Float32Array(positions);
  scope.postMessage({ positions: buffer }, [buffer.buffer]);
});
