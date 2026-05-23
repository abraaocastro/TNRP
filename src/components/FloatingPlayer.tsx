import { useState, useCallback, useRef, useEffect } from "react";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { TwitchEmbed } from "./TwitchEmbed";
import { KickEmbed } from "./KickEmbed";
import { AudioControls } from "./AudioControls";
import type { PlayerData, PlayerControls } from "../types/player";

interface FloatingPlayerProps {
  player: PlayerData;
  onClose: (id: string) => void;
  onUpdate: (id: string, patch: Partial<PlayerData>) => void;
}

const HEADER_H = 44;
const MIN_W = 400;
const MIN_H = 260;

const PLATFORM_LABEL: Record<string, string> = {
  youtube: "YouTube",
  twitch: "Twitch",
  kick: "Kick",
};

/**
 * Ícone de mão/move (drag handle).
 * Apenas clicar e segurar nesse ícone inicia o drag.
 */
function HandIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}

export function FloatingPlayer({ player, onClose, onUpdate }: FloatingPlayerProps) {
  const controlsRef = useRef<PlayerControls>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  /* Refs para valores mutáveis dentro de listeners */
  const posRef = useRef({ x: player.x, y: player.y });
  const sizeRef = useRef({ w: player.width, h: player.height });
  const cbRef = useRef({ onUpdate, onClose, id: player.id });

  useEffect(() => { posRef.current = { x: player.x, y: player.y }; }, [player.x, player.y]);
  useEffect(() => { sizeRef.current = { w: player.width, h: player.height }; }, [player.width, player.height]);
  useEffect(() => { cbRef.current = { onUpdate, onClose, id: player.id }; }, [onUpdate, onClose, player.id]);

  /* Sincronizar volume / mute */
  useEffect(() => { controlsRef.current?.setVolume(player.volume); }, [player.volume]);
  useEffect(() => { controlsRef.current?.setMuted(player.muted); }, [player.muted]);

  /* Aplicar posição/tamanho via DOM quando props mudam */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.transform = `translate(${player.x}px, ${player.y}px)`;
    el.style.width = `${player.width}px`;
    el.style.height = `${player.height}px`;
  }, [player.x, player.y, player.width, player.height]);

  /* ═══════════════════════════════════════════════════════════
     DRAG — apenas a partir do ícone de mão.
     Pointer Events + setPointerCapture + listeners no document
     como fallback (dupla camada de redundância).
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const handle = dragHandleRef.current;
    const wrap = wrapRef.current;
    if (!handle || !wrap) return;

    let mx0 = 0, my0 = 0, px0 = 0, py0 = 0;
    let active = false;
    let pointerId: number | null = null;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      // Capturar pointer pra garantir que pointermove/up vêm pra cá
      try {
        handle.setPointerCapture(e.pointerId);
        pointerId = e.pointerId;
      } catch {
        pointerId = e.pointerId; // segue mesmo sem capture
      }

      mx0 = e.clientX;
      my0 = e.clientY;
      px0 = posRef.current.x;
      py0 = posRef.current.y;
      active = true;
      setIsDragging(true);
    };

    const onMove = (e: PointerEvent) => {
      if (!active) return;
      if (pointerId !== null && e.pointerId !== pointerId) return;
      const nx = px0 + e.clientX - mx0;
      const ny = py0 + e.clientY - my0;
      posRef.current = { x: nx, y: ny };
      wrap.style.transform = `translate(${nx}px, ${ny}px)`;
    };

    const onUp = (e: PointerEvent) => {
      if (!active) return;
      if (pointerId !== null && e.pointerId !== pointerId) return;
      try { handle.releasePointerCapture(e.pointerId); } catch { /* já liberado */ }
      pointerId = null;
      active = false;
      setIsDragging(false);
      cbRef.current.onUpdate(cbRef.current.id, {
        x: posRef.current.x,
        y: posRef.current.y,
      });
    };

    // Listeners no próprio handle (com setPointerCapture)
    handle.addEventListener("pointerdown", onDown);
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);

    // Fallback no document caso pointer capture falhe
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);

    return () => {
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  }, []);

  /* ═══════════════════════════════════════════════════════════
     RESIZE via Pointer Events
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const grip = gripRef.current;
    const wrap = wrapRef.current;
    if (!grip || !wrap) return;

    let mx0 = 0, my0 = 0, w0 = 0, h0 = 0;
    let active = false;
    let pointerId: number | null = null;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        grip.setPointerCapture(e.pointerId);
        pointerId = e.pointerId;
      } catch {
        pointerId = e.pointerId;
      }
      mx0 = e.clientX;
      my0 = e.clientY;
      w0 = sizeRef.current.w;
      h0 = sizeRef.current.h;
      active = true;
    };

    const onMove = (e: PointerEvent) => {
      if (!active) return;
      if (pointerId !== null && e.pointerId !== pointerId) return;
      const maxW = Math.floor(window.innerWidth * 0.85);
      const maxH = Math.floor(window.innerHeight * 0.85);
      const nw = Math.max(MIN_W, Math.min(maxW, w0 + e.clientX - mx0));
      const nh = Math.max(MIN_H, Math.min(maxH, h0 + e.clientY - my0));
      sizeRef.current = { w: nw, h: nh };
      wrap.style.width = `${nw}px`;
      wrap.style.height = `${nh}px`;
    };

    const onUp = (e: PointerEvent) => {
      if (!active) return;
      if (pointerId !== null && e.pointerId !== pointerId) return;
      try { grip.releasePointerCapture(e.pointerId); } catch { /* já liberado */ }
      pointerId = null;
      active = false;
      cbRef.current.onUpdate(cbRef.current.id, {
        width: sizeRef.current.w,
        height: sizeRef.current.h,
      });
    };

    grip.addEventListener("pointerdown", onDown);
    grip.addEventListener("pointermove", onMove);
    grip.addEventListener("pointerup", onUp);
    grip.addEventListener("pointercancel", onUp);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);

    return () => {
      grip.removeEventListener("pointerdown", onDown);
      grip.removeEventListener("pointermove", onMove);
      grip.removeEventListener("pointerup", onUp);
      grip.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  }, []);

  /* CLOSE — listener nativo */
  useEffect(() => {
    const btn = closeBtnRef.current;
    if (!btn) return;
    const handler = (e: MouseEvent) => {
      e.stopPropagation();
      cbRef.current.onClose(cbRef.current.id);
    };
    btn.addEventListener("click", handler);
    return () => btn.removeEventListener("click", handler);
  }, []);

  const handleVolumeChange = useCallback(
    (volume: number) => onUpdate(player.id, { volume, muted: volume === 0 }),
    [onUpdate, player.id],
  );
  const handleMutedChange = useCallback(
    (muted: boolean) => onUpdate(player.id, { muted }),
    [onUpdate, player.id],
  );

  const renderEmbed = () => {
    switch (player.platform) {
      case "youtube":
        return (
          <YouTubeEmbed
            ref={controlsRef}
            videoId={player.embedId}
            initialVolume={player.volume}
            initialMuted={player.muted}
          />
        );
      case "twitch":
        return (
          <TwitchEmbed
            ref={controlsRef}
            embedId={player.embedId}
            initialVolume={player.volume}
            initialMuted={player.muted}
          />
        );
      case "kick":
        return (
          <KickEmbed
            ref={controlsRef}
            embedId={player.embedId}
            initialMuted={player.muted}
          />
        );
    }
  };

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: `translate(${player.x}px, ${player.y}px)`,
        width: player.width,
        height: player.height,
        zIndex: 2147483647,
      }}
    >
      {/*
        IMPORTANTE: a animação `tnrp-animate-in` fica no card INTERNO,
        não no wrap. Por CSS spec, animações sobrescrevem inline styles
        para as propriedades animadas — se a classe estivesse no wrap,
        o `transform: scale(1) translateY(0)` do keyframe `to` (com
        fill-mode `both`) sobrescreveria o transform de posicionamento
        e o player ficaria preso na origem (canto superior esquerdo).
      */}
      <div
        className={`tnrp-animate-in flex h-full flex-col overflow-hidden rounded-xl border-2 bg-slate-900 shadow-2xl transition-opacity ${
          isDragging ? "opacity-80 border-sky-500" : "border-slate-600"
        }`}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between bg-slate-800 px-2"
          style={{ height: HEADER_H }}
        >
          {/* DRAG HANDLE — ícone de mão. Apenas aqui inicia o drag */}
          <div
            ref={dragHandleRef}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
              isDragging
                ? "bg-sky-500/30 text-sky-300"
                : "text-slate-400 hover:bg-slate-700 hover:text-sky-400"
            }`}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "none",
              userSelect: "none",
            }}
            title="Segure e arraste para mover"
          >
            <HandIcon />
          </div>

          {/* Plataforma + ID */}
          <div className="flex flex-1 items-center gap-2 overflow-hidden px-2">
            <span className="shrink-0 rounded bg-sky-500/20 px-2 py-0.5 text-xs font-bold text-sky-400">
              {PLATFORM_LABEL[player.platform] ?? player.platform}
            </span>
            <span className="select-none truncate text-sm text-slate-300">
              {player.embedId}
            </span>
          </div>

          {/* Controles (volume + close) */}
          <div className="flex items-center gap-1">
            <AudioControls
              volume={player.volume}
              muted={player.muted}
              onVolumeChange={handleVolumeChange}
              onMutedChange={handleMutedChange}
            />
            <button
              ref={closeBtnRef}
              className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-base text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
              title="Fechar radinho"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Embed area */}
        <div className="relative flex-1">{renderEmbed()}</div>
      </div>

      {/* Resize grip (canto inferior direito) */}
      <div
        ref={gripRef}
        className="absolute bottom-0 right-0 z-20 flex h-5 w-5 cursor-se-resize items-end justify-end"
        style={{ borderRadius: "0 0 12px 0", touchAction: "none" }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" className="text-sky-400/60">
          <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5" />
          <line x1="9" y1="5" x2="5" y2="9" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
