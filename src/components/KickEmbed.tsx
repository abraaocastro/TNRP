import { forwardRef, useImperativeHandle } from "react";
import type { PlayerControls } from "../types/player";

interface KickEmbedProps {
  embedId: string;
  initialMuted: boolean;
}

/**
 * Embed de Kick.com via player.kick.com.
 * Suporta canais ao vivo e VODs (prefixo "video:").
 */
export const KickEmbed = forwardRef<PlayerControls, KickEmbedProps>(
  function KickEmbed({ embedId, initialMuted }, ref) {
    const isVod = embedId.startsWith("video:");
    const mutedParam = initialMuted ? "&muted=true" : "";

    const src = isVod
      ? `https://player.kick.com/video/${embedId.slice(6)}?autoplay=true${mutedParam}`
      : `https://player.kick.com/${embedId}?autoplay=true${mutedParam}`;

    // Kick não expõe API de controle via postMessage — controle limitado
    useImperativeHandle(
      ref,
      () => ({
        setVolume: () => {},
        setMuted: () => {},
      }),
      [],
    );

    return (
      <iframe
        src={src}
        className="h-full w-full"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        style={{ border: "none" }}
      />
    );
  },
);
