import { describe, expect, it } from "vitest";
import { searchGazetteer } from "@/lib/gazetteer";

const OCEANS = ["Atlantique", "Pacifique", "Indien", "Arctique", "Austral"];

describe("searchGazetteer", () => {
  it("place les cinq océans avant les autres reliefs", () => {
    const names = searchGazetteer("océan").map((hit) => hit.location.name);
    expect(names.slice(0, 5).every((name) => OCEANS.includes(name))).toBe(true);
    expect(new Set(names.slice(0, 5)).size).toBe(5);
  });

  it("trouve Nil, Nil Albert et Victoria Nile", () => {
    const names = searchGazetteer("nil").map((hit) => hit.location.name);
    expect(names).toEqual(["Nil", "Nil Albert", "Victoria Nile"]);
  });
});
