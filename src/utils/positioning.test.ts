import { describe, it, expect, beforeEach } from "vitest";
import { findFreePosition } from "./positioning";
import type { PlayerData } from "../types/player";

function makePlayer(overrides: Partial<PlayerData> = {}): PlayerData {
  return {
    id: "p1",
    platform: "youtube",
    embedId: "test",
    x: 0,
    y: 0,
    width: 480,
    height: 270,
    volume: 50,
    muted: false,
    ...overrides,
  };
}

describe("findFreePosition", () => {
  beforeEach(() => {
    // Simular viewport 1920x1080
    Object.defineProperty(window, "innerWidth", { value: 1920, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 1080, writable: true });
  });

  it("primeiro player vai para o canto bottom-right", () => {
    const pos = findFreePosition([]);
    expect(pos.x).toBe(1920 - 480 - 16); // vw - width - padding
    expect(pos.y).toBe(1080 - 270 - 16); // vh - height - padding
  });

  it("segundo player evita sobreposição", () => {
    const first = makePlayer({
      x: 1920 - 480 - 16,
      y: 1080 - 270 - 16,
      width: 480,
      height: 270,
    });
    const pos = findFreePosition([first]);
    // Não deve sobrepor o primeiro
    const overlaps =
      pos.x < first.x + first.width &&
      pos.x + pos.width > first.x &&
      pos.y < first.y + first.height &&
      pos.y + pos.height > first.y;
    expect(overlaps).toBe(false);
  });

  it("retorna dimensões padrão 480x270", () => {
    const pos = findFreePosition([]);
    expect(pos.width).toBe(480);
    expect(pos.height).toBe(270);
  });

  it("aceita dimensões customizadas", () => {
    const pos = findFreePosition([], 640, 360);
    expect(pos.width).toBe(640);
    expect(pos.height).toBe(360);
  });

  it("fallback com 3 players não sai do viewport", () => {
    const players = [
      makePlayer({ id: "p1", x: 1920 - 496, y: 1080 - 286 }),
      makePlayer({ id: "p2", x: 16, y: 1080 - 286 }),
      makePlayer({ id: "p3", x: 1920 - 496, y: 16 }),
    ];
    const pos = findFreePosition(players);
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.x + pos.width).toBeLessThanOrEqual(1920);
    expect(pos.y + pos.height).toBeLessThanOrEqual(1080);
  });
});
