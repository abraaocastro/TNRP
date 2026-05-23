import { useState, useCallback, useRef, useEffect } from "react";

interface AddRadinhoProps {
  playerCount: number;
  onAdd: (url: string) => void;
}

const MAX_PLAYERS = 3;

export function AddRadinho({ playerCount, onAdd }: AddRadinhoProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isFull = playerCount >= MAX_PLAYERS;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = url.trim();
      if (!trimmed) return;

      try {
        new URL(trimmed);
      } catch {
        setError("URL inválida");
        return;
      }

      onAdd(trimmed);
      setUrl("");
      setError("");
      setOpen(false);
    },
    [url, onAdd],
  );

  if (!open) {
    return (
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setOpen(true)}
          disabled={isFull}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl text-2xl font-bold transition-all ${
            isFull
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : "bg-sky-500 text-white hover:bg-sky-400 hover:scale-110"
          }`}
          title={isFull ? `Limite de ${MAX_PLAYERS} radinhos` : "Adicionar radinho"}
        >
          +
        </button>
        {isFull && (
          <span className="absolute -top-8 right-0 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-400 shadow">
            máx {MAX_PLAYERS}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6">
      <form
        onSubmit={handleSubmit}
        className="tnrp-animate-slide-up flex flex-col gap-3 rounded-xl border-2 border-slate-600 bg-slate-900 p-4 shadow-2xl"
        style={{ width: 380 }}
      >
        <label className="text-sm font-medium text-slate-200">
          Cole o link da live (YouTube, Twitch ou Kick)
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
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-400"
          >
            Ligar
          </button>
        </div>

        {error && <span className="text-sm text-red-400">{error}</span>}

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {playerCount}/{MAX_PLAYERS} radinhos
          </span>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setUrl("");
              setError("");
            }}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
