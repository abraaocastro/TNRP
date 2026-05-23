import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { FloatingPlayer } from "../components/FloatingPlayer";
import { AddRadinho } from "../components/AddRadinho";
import { OnboardingTooltip } from "../components/OnboardingTooltip";
import { parseStreamUrl } from "../utils/parseUrl";
import { findFreePosition } from "../utils/positioning";
import { toggleHostPlayback } from "../utils/hostPlayer";
import { usePlayersStorage } from "../hooks/usePlayersStorage";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useViewportGuard } from "../hooks/useViewportGuard";
import type { PlayerData } from "../types/player";
import type { Message } from "../types/messages";

const ROOT_ID = "tnrp-root";

function generateId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function App() {
  const { players, setPlayers, loaded } = usePlayersStorage();
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(false);

  /* ═══════════════════════════════════════════════════════════
     Handlers de players (useCallback para estabilidade)
     ═══════════════════════════════════════════════════════════ */
  const addPlayer = useCallback(
    (url: string) => {
      const parsed = parseStreamUrl(url);
      if (!parsed) return;

      setPlayers((prev) => {
        if (prev.length >= 3) return prev;

        const pos = findFreePosition(prev);

        const newPlayer: PlayerData = {
          id: generateId(),
          platform: parsed.platform,
          embedId: parsed.embedId,
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: pos.height,
          volume: 50,
          muted: false,
        };
        return [...prev, newPlayer];
      });
    },
    [setPlayers],
  );

  const removePlayer = useCallback(
    (id: string) => {
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    },
    [setPlayers],
  );

  const updatePlayer = useCallback(
    (id: string, patch: Partial<PlayerData>) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      );
    },
    [setPlayers],
  );

  // Mute/unmute all
  const toggleMuteAll = useCallback(() => {
    setPlayers((prev) => {
      const anyUnmuted = prev.some((p) => !p.muted);
      return prev.map((p) => ({ ...p, muted: anyUnmuted }));
    });
  }, [setPlayers]);

  // Toggle visibilidade
  const toggleVisibility = useCallback(() => {
    setHidden((h) => !h);
  }, []);

  /* ═══════════════════════════════════════════════════════════
     Refs para handlers — evita closures stale no listener
     de mensagens (que roda com [] deps, uma vez só)
     ═══════════════════════════════════════════════════════════ */
  const addPlayerRef = useRef(addPlayer);
  const removePlayerRef = useRef(removePlayer);
  useEffect(() => { addPlayerRef.current = addPlayer; }, [addPlayer]);
  useEffect(() => { removePlayerRef.current = removePlayer; }, [removePlayer]);

  /* ═══════════════════════════════════════════════════════════
     MENSAGENS — listener único, sempre ativo desde o mount.
     Sem race conditions: React monta → listener registra
     imediatamente → qualquer mensagem futura é processada.
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    // Verificar estado inicial
    chrome.runtime.sendMessage({ type: "GET_STATE" } satisfies Message)
      .then((res) => {
        if (res?.active) setActive(true);
      })
      .catch(() => {
        // Background não disponível (normal durante reload)
      });

    const handler = (message: Message) => {
      switch (message.type) {
        case "SET_STATE":
          setActive(message.active);
          break;
        case "ADD_PLAYER":
          setActive(true); // Auto-ativar quando adiciona player
          addPlayerRef.current(message.url);
          break;
        case "REMOVE_PLAYER":
          removePlayerRef.current(message.playerId);
          break;
      }
    };

    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  /* ═══════════════════════════════════════════════════════════
     Atalhos de teclado (só ativos quando visível)
     ═══════════════════════════════════════════════════════════ */
  const shortcutHandlers = useMemo(
    () => ({
      onPausePlayHost: toggleHostPlayback,
      onToggleVisibility: toggleVisibility,
      onMuteAll: toggleMuteAll,
    }),
    [toggleVisibility, toggleMuteAll],
  );
  useKeyboardShortcuts(shortcutHandlers);

  // Viewport guard (resize clamp + fullscreen re-attach)
  useViewportGuard(players, updatePlayer, ROOT_ID);

  /* ═══════════════════════════════════════════════════════════
     Render — null quando inativo ou dados não carregados
     ═══════════════════════════════════════════════════════════ */
  if (!loaded || !active) return null;

  return (
    <div style={{ display: hidden ? "none" : "contents" }}>
      {players.map((player) => (
        <FloatingPlayer
          key={player.id}
          player={player}
          onClose={removePlayer}
          onUpdate={updatePlayer}
        />
      ))}

      <AddRadinho playerCount={players.length} onAdd={addPlayer} />

      {/* Onboarding no primeiro uso */}
      {players.length === 0 && <OnboardingTooltip />}
    </div>
  );
}
