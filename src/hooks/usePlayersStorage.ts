import { useState, useEffect, useCallback, useRef } from "react";
import type { PlayerData } from "../types/player";

const STORAGE_KEY = "tnrp_players";

/**
 * T5.5 — Persiste lista de players (posição, tamanho, volume) no chrome.storage.local.
 * Debounce de 500ms para não sobrecarregar writes em drag/resize.
 */
export function usePlayersStorage() {
  const [players, setPlayersState] = useState<PlayerData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Carregar do storage na montagem
  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY).then((result) => {
      const saved = result[STORAGE_KEY] as PlayerData[] | undefined;
      if (saved?.length) {
        setPlayersState(saved);
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((next: PlayerData[]) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      chrome.storage.local.set({ [STORAGE_KEY]: next });
    }, 500);
  }, []);

  const setPlayers = useCallback(
    (updater: PlayerData[] | ((prev: PlayerData[]) => PlayerData[])) => {
      setPlayersState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return { players, setPlayers, loaded } as const;
}
