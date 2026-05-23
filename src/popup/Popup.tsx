import { useState, useEffect, useCallback, useRef } from "react";
import { parseStreamUrl } from "../utils/parseUrl";
import type { PlayerData } from "../types/player";
import type { Message } from "../types/messages";

const STORAGE_KEY = "tnrp_players";
const MAX_PLAYERS = 3;

export function Popup() {
  const [active, setActive] = useState(false);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Carregar estado e players ao abrir o popup
  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_STATE" } satisfies Message).then((res) => {
      setActive(res?.active ?? false);
    });

    chrome.storage.local.get(STORAGE_KEY).then((result) => {
      const saved = result[STORAGE_KEY] as PlayerData[] | undefined;
      if (saved) setPlayers(saved);
    });

    // Escutar mudanças no storage para atualizar lista em tempo real
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[STORAGE_KEY]) {
        setPlayers(changes[STORAGE_KEY].newValue ?? []);
      }
    };
    chrome.storage.local.onChanged.addListener(listener);
    return () => chrome.storage.local.onChanged.removeListener(listener);
  }, []);

  // T6.4 — Toggle on/off geral
  const handleToggle = useCallback(() => {
    const newActive = !active;
    setActive(newActive);
    chrome.runtime.sendMessage({ type: "SET_STATE", active: newActive } satisfies Message);
  }, [active]);

  // T6.1 + T6.2 — Adicionar radinho com validação
  const handleAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = url.trim();
      if (!trimmed) return;

      const parsed = parseStreamUrl(trimmed);
      if (!parsed) {
        setError("Use um link do YouTube, Twitch ou Kick");
        return;
      }

      chrome.runtime.sendMessage({ type: "ADD_PLAYER", url: trimmed } satisfies Message);
      setUrl("");
      setError("");
      setActive(true);
    },
    [url],
  );

  // T6.3 — Remover radinho
  const handleRemove = useCallback((playerId: string) => {
    chrome.runtime.sendMessage({ type: "REMOVE_PLAYER", playerId } satisfies Message);
  }, []);

  const isFull = players.length >= MAX_PLAYERS;

  return (
    <div className="w-80 bg-slate-900 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-sky-400">TNRP</span>
          <span className="text-[10px] text-slate-500">v0.1.0</span>
        </div>

        {/* Toggle on/off — alinhamento simétrico (2px de gap em ambos os lados) */}
        <button
          onClick={handleToggle}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            active ? "bg-sky-500" : "bg-slate-600"
          }`}
          title={active ? "Desativar TNRP" : "Ativar TNRP"}
        >
          <span
            className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: active ? "translateX(20px)" : "translateX(0)" }}
          />
        </button>
      </div>

      {/* Formulário de URL */}
      <form onSubmit={handleAdd} className="border-b border-slate-700 px-4 py-3">
        <label className="mb-1.5 block text-xs font-medium text-slate-400">
          Link da live
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
            placeholder="https://twitch.tv/cazetv"
            disabled={isFull}
            className="flex-1 rounded border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isFull}
            className="rounded bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ligar
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {isFull && (
          <p className="mt-1 text-xs text-amber-400">
            Limite de {MAX_PLAYERS} radinhos atingido
          </p>
        )}
      </form>

      {/* Lista de radinhos ativos */}
      <div className="px-4 py-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Radinhos ativos ({players.length}/{MAX_PLAYERS})
        </h2>

        {players.length === 0 ? (
          <p className="py-2 text-center text-xs text-slate-500">
            Nenhum radinho ligado
          </p>
        ) : (
          <ul className="space-y-1.5">
            {players.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded bg-slate-800 px-3 py-2"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      p.platform === "youtube"
                        ? "bg-red-500/20 text-red-400"
                        : p.platform === "twitch"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {p.platform === "youtube" ? "YT" : p.platform === "twitch" ? "TW" : "KK"}
                  </span>
                  <span className="truncate text-xs text-slate-300">{p.embedId}</span>
                </div>

                <button
                  onClick={() => handleRemove(p.id)}
                  className="ml-2 shrink-0 rounded p-1 text-slate-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
                  title="Remover radinho"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <line x1="2" y1="2" x2="10" y2="10" />
                    <line x1="10" y1="2" x2="2" y2="10" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* T7.4 — Atalhos de teclado */}
      <div className="border-t border-slate-700 px-4 py-3">
        <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Atalhos
        </h2>
        <div className="space-y-1 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>Ligar/desligar TNRP</span>
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-slate-300">Alt+R</kbd>
          </div>
          <div className="flex justify-between">
            <span>Pause/play transmissão</span>
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-slate-300">Shift+Space</kbd>
          </div>
          <div className="flex justify-between">
            <span>Esconder/mostrar radinhos</span>
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-slate-300">Alt+H</kbd>
          </div>
          <div className="flex justify-between">
            <span>Mutar todos</span>
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-slate-300">Alt+M</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
