import { useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import type { PlayerControls } from "../types/player";

interface YouTubeEmbedProps {
  videoId: string;
  initialVolume: number;
  initialMuted: boolean;
}

/**
 * Embed de YouTube com controle de volume via IFrame postMessage API.
 *
 * Nota: O YouTube tem proteção anti-embed quando o iframe roda dentro
 * do próprio youtube.com. Não há solução robusta sem quebrar
 * autenticação/DRM (que causaria tela preta para todos os vídeos).
 * Trade-off aceito: YouTube-on-YouTube não funciona, mas tudo funciona
 * em qualquer outro site (twitch.tv, ge.globo, etc.).
 */
export const YouTubeEmbed = forwardRef<PlayerControls, YouTubeEmbedProps>(
  function YouTubeEmbed({ videoId, initialVolume, initialMuted }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const postCommand = useCallback((func: string, args: unknown[] = []) => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "https://www.youtube.com",
      );
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        setVolume: (volume: number) => postCommand("setVolume", [volume]),
        setMuted: (muted: boolean) => postCommand(muted ? "mute" : "unMute"),
      }),
      [postCommand],
    );

    const handleLoad = useCallback(() => {
      setTimeout(() => {
        postCommand("setVolume", [initialVolume]);
        if (initialMuted) postCommand("mute");
      }, 500);
    }, [postCommand, initialVolume, initialMuted]);

    return (
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0`}
        className="h-full w-full"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        onLoad={handleLoad}
        style={{ border: "none" }}
      />
    );
  },
);
