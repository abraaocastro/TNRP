import { useEffect, useCallback } from "react";
import type { PlayerData } from "../types/player";

/**
 * T8.4 + T8.5 — Responsividade e edge cases.
 *
 * - Ao redimensionar a janela, clampa os players para ficarem visíveis.
 * - Ao entrar em fullscreen, re-attach o container TNRP ao elemento fullscreen.
 * - Ao sair de fullscreen, volta o container para o body.
 */
export function useViewportGuard(
  players: PlayerData[],
  onUpdate: (id: string, patch: Partial<PlayerData>) => void,
  containerId: string,
) {
  // Clampar players ao viewport após resize
  const clampPlayers = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 32;

    for (const p of players) {
      const maxX = Math.max(margin, vw - p.width - margin);
      const maxY = Math.max(margin, vh - p.height - margin);

      const clampedX = Math.min(Math.max(margin, p.x), maxX);
      const clampedY = Math.min(Math.max(margin, p.y), maxY);

      if (clampedX !== p.x || clampedY !== p.y) {
        onUpdate(p.id, { x: clampedX, y: clampedY });
      }
    }
  }, [players, onUpdate]);

  // Resize listener
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timeout);
      timeout = setTimeout(clampPlayers, 200);
    };

    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
      clearTimeout(timeout);
    };
  }, [clampPlayers]);

  // Fullscreen: mover container para dentro do elemento fullscreen
  useEffect(() => {
    const handler = () => {
      const container = document.getElementById(containerId);
      if (!container) return;

      const fsEl = document.fullscreenElement;
      if (fsEl && fsEl !== document.documentElement) {
        // Entrando em fullscreen — move overlay para dentro do elemento
        fsEl.appendChild(container);
      } else {
        // Saindo de fullscreen — volta para o body
        if (container.parentElement !== document.body) {
          document.body.appendChild(container);
        }
      }
    };

    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [containerId]);
}
