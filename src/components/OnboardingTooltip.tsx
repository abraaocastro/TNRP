import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "tnrp_onboarding_done";

export function OnboardingTooltip() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY).then((result) => {
      if (!result[STORAGE_KEY]) {
        setShow(true);
      }
    });
  }, []);

  const dismiss = useCallback(() => {
    setShow(false);
    chrome.storage.local.set({ [STORAGE_KEY]: true });
  }, []);

  if (!show) return null;

  return (
    <div className="tnrp-animate-slide-up fixed bottom-24 right-6">
      <div className="tnrp-tooltip-bounce relative rounded-xl border border-sky-500/30 bg-slate-800 p-5 shadow-2xl" style={{ maxWidth: 340 }}>
        {/* Seta */}
        <div className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b border-r border-sky-500/30 bg-slate-800" />

        <h3 className="mb-3 text-base font-bold text-sky-400">
          Bem-vindo ao TNRP!
        </h3>
        <ul className="mb-4 space-y-2 text-sm text-slate-300">
          <li>
            <strong className="text-slate-100">1.</strong> Clique no{" "}
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">+</span>{" "}
            e cole o link da live
          </li>
          <li>
            <strong className="text-slate-100">2.</strong> Arraste e redimensione o player
          </li>
          <li>
            <strong className="text-slate-100">3.</strong> Use{" "}
            <kbd className="rounded-md bg-slate-700 px-1.5 py-0.5 font-mono text-xs">Shift+Space</kbd>{" "}
            para pausar e sincronizar
          </li>
        </ul>

        <button
          onClick={dismiss}
          className="w-full rounded-lg bg-sky-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-400"
        >
          Entendi!
        </button>
      </div>
    </div>
  );
}
