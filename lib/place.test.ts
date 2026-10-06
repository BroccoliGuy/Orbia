import { describe, expect, it } from "vitest";
import { LAKES, interiorPoint } from "@/data/features";
import { searchGazetteer } from "@/lib/gazetteer";
import { describePlace, selectionFromPlace } from "@/lib/place";

describe("describePlace", () => {
  it("nomme un point du Pacifique sans sous-titre", () => {
    const place = describePlace(0, -150, -4000, null);
    expect(place.name).toBe("Océan Pacifique");
    expect(place.subtitle).toBe("");
  });

  it("garde le nom et le genre d'un fleuve", () => {
    const river = searchGazetteer("nil")[0].location;
    const place = describePlace(river.lat, river.lon, 200, null);
    const card = selectionFromPlace(river.lat, river.lon, place);
    expect(card.name).toBe("Nil");
    expect(card.kind).toBe("river");
  });

  it("garde le nom et le genre d'un lac", () => {
    const lake = LAKES.find((item) => item.name === "Léman");
    expect(lake).toBeTruthy();
    const inside = interiorPoint(lake!.points);
    const place = describePlace(inside.lat, inside.lon, 372, null);
    const card = selectionFromPlace(inside.lat, inside.lon, place);
    expect(card.name).toBe("Léman");
    expect(card.kind).toBe("lake");
  });
});
