import { useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import type { PlayerControls } from "../types/player";

interface TwitchEmbedProps {
  embedId: string;
  initialVolume: number;
  initialMuted: boolean;
}

/**
 * T3.4 + T4.4 — Embed de Twitch com controle de volume.
 *
 * Volume inicial via query params (&muted=true/false).
 * Controle runtime via postMessage para o iframe do player.twitch.tv:
 *   { "eventName": "setVolume", "params": { "volume": 0.0-1.0 } }
 *   { "eventName": "setMuted",  "params": { "muted": true/false } }
 */
export const TwitchEmbed = forwardRef<PlayerControls, TwitchEmbedProps>(
  function TwitchEmbed({ embedId, initialVolume, initialMuted }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const postCommand = useCallback((eventName: string, params: Record<string, unknown>) => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      iframe.contentWindow.postMessage(
        { eventName, params, namespace: "twitch-embed-player-proxy" },
        "https://player.twitch.tv",
      );
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        // Twitch volume é 0.0 - 1.0
        setVolume: (volume: number) =>
          postCommand("setVolume", { volume: volume / 100 }),
        setMuted: (muted: boolean) =>
          postCommand("setMuted", { muted }),
      }),
      [postCommand],
    );

    const isVod = embedId.startsWith("video:");
    const parent = location.hostname;
    const mutedParam = initialMuted ? "true" : "false";
    const volumeParam = (initialVolume / 100).toFixed(2);

    const src = isVod
      ? `https://player.twitch.tv/?video=${embedId.slice(6)}&parent=${parent}&autoplay=true&muted=${mutedParam}&volume=${volumeParam}`
      : `https://player.twitch.tv/?channel=${embedId}&parent=${parent}&autoplay=true&muted=${mutedParam}&volume=${volumeParam}`;

    return (
      <iframe
        ref={iframeRef}
        src={src}
        className="h-full w-full"
        allow="autoplay; encrypted-media"
        allowFullScreen
        style={{ border: "none" }}
      />
    );
  },
);
