import { describe, it, expect, vi, beforeEach } from "vitest";
import { toggleHostPlayback } from "./hostPlayer";

describe("toggleHostPlayback", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("dá play em vídeo pausado", () => {
    const video = document.createElement("video");
    Object.defineProperty(video, "paused", { value: true, writable: true });
    video.play = vi.fn().mockResolvedValue(undefined);
    video.pause = vi.fn();

    // Simular tamanho visível
    vi.spyOn(video, "getBoundingClientRect").mockReturnValue({
      width: 1280,
      height: 720,
      top: 0,
      left: 0,
      bottom: 720,
      right: 1280,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    document.body.appendChild(video);
    toggleHostPlayback();
    expect(video.play).toHaveBeenCalledOnce();
  });

  it("pausa vídeo em reprodução", () => {
    const video = document.createElement("video");
    Object.defineProperty(video, "paused", { value: false, writable: true });
    video.play = vi.fn().mockResolvedValue(undefined);
    video.pause = vi.fn();

    vi.spyOn(video, "getBoundingClientRect").mockReturnValue({
      width: 1280,
      height: 720,
      top: 0,
      left: 0,
      bottom: 720,
      right: 1280,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    document.body.appendChild(video);
    toggleHostPlayback();
    expect(video.pause).toHaveBeenCalledOnce();
  });

  it("não falha quando não há vídeos na página", () => {
    expect(() => toggleHostPlayback()).not.toThrow();
  });

  it("seleciona o maior vídeo quando há múltiplos", () => {
    const small = document.createElement("video");
    Object.defineProperty(small, "paused", { value: true, writable: true });
    small.play = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(small, "getBoundingClientRect").mockReturnValue({
      width: 320, height: 180, top: 0, left: 0, bottom: 180, right: 320, x: 0, y: 0, toJSON: () => ({}),
    });

    const big = document.createElement("video");
    Object.defineProperty(big, "paused", { value: true, writable: true });
    big.play = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(big, "getBoundingClientRect").mockReturnValue({
      width: 1920, height: 1080, top: 0, left: 0, bottom: 1080, right: 1920, x: 0, y: 0, toJSON: () => ({}),
    });

    document.body.appendChild(small);
    document.body.appendChild(big);

    toggleHostPlayback();
    expect(big.play).toHaveBeenCalledOnce();
    expect(small.play).not.toHaveBeenCalled();
  });
});
