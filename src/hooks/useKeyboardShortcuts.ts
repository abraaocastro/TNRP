import { useEffect } from "react";

interface ShortcutHandlers {
  onPausePlayHost: () => void;
  onToggleVisibility: () => void;
  onMuteAll: () => void;
}

/**
 * T7.1, T7.2, T7.3 — Atalhos de teclado in-page.
 *
 * Shift+Space  → Pause/Play da transmissão original
 * Alt+H        → Esconder/mostrar radinhos (sem fechar)
 * Alt+M        → Mutar/desmutar todos os radinhos
 *
 * Registra no document (fora do Shadow DOM) para capturar
 * eventos mesmo quando o foco está no site host.
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignorar se o usuário está digitando em input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Shift + Space → Pause/Play host
      if (e.shiftKey && e.code === "Space" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        handlers.onPausePlayHost();
        return;
      }

      // Alt + H → Toggle visibilidade
      if (e.altKey && e.code === "KeyH" && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        handlers.onToggleVisibility();
        return;
      }

      // Alt + M → Mute all
      if (e.altKey && e.code === "KeyM" && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        handlers.onMuteAll();
        return;
      }
    };

    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [handlers]);
}
