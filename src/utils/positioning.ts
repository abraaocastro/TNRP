import type { PlayerData } from "../types/player";

const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 270;
const PADDING = 16;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/**
 * T5.4 — Encontra uma posição que não sobrepõe os players existentes.
 *
 * Estratégia: tenta cantos do viewport (bottom-right, bottom-left, top-right, top-left),
 * depois faz offset diagonal até achar espaço livre.
 */
export function findFreePosition(
  existing: PlayerData[],
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
): { x: number; y: number; width: number; height: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const candidates = [
    { x: vw - width - PADDING, y: vh - height - PADDING },
    { x: PADDING, y: vh - height - PADDING },
    { x: vw - width - PADDING, y: PADDING },
    { x: PADDING, y: PADDING },
  ];

  const rects: Rect[] = existing.map((p) => ({
    x: p.x,
    y: p.y,
    w: p.width,
    h: p.height,
  }));

  for (const candidate of candidates) {
    const r: Rect = { x: candidate.x, y: candidate.y, w: width, h: height };
    if (!rects.some((existing) => overlaps(r, existing))) {
      return { ...candidate, width, height };
    }
  }

  // Fallback: offset diagonal a partir do último player
  const last = existing[existing.length - 1];
  const offset = existing.length * 48;
  return {
    x: Math.min((last?.x ?? 0) + offset, vw - width - PADDING),
    y: Math.min((last?.y ?? 0) + offset, vh - height - PADDING),
    width,
    height,
  };
}
