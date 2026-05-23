export type Platform = "youtube" | "twitch" | "kick";

export interface ParsedUrl {
  platform: Platform;
  embedId: string;
}

/**
 * Detecta plataforma e extrai o ID de embed a partir de uma URL.
 *
 * YouTube:
 *   - youtube.com/watch?v=VIDEO_ID
 *   - youtu.be/VIDEO_ID
 *   - youtube.com/live/VIDEO_ID
 *   - youtube.com/embed/VIDEO_ID
 *
 * Twitch:
 *   - twitch.tv/CHANNEL
 *   - twitch.tv/videos/VOD_ID
 *
 * Kick:
 *   - kick.com/CHANNEL
 *   - kick.com/video/UUID
 */
export function parseStreamUrl(raw: string): ParsedUrl | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace("www.", "");

  // --- YouTube ---
  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = url.searchParams.get("v");
    if (v) return { platform: "youtube", embedId: v };

    const pathMatch = url.pathname.match(/^\/(live|embed)\/([^/?]+)/);
    if (pathMatch?.[2]) return { platform: "youtube", embedId: pathMatch[2] };

    return null;
  }

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    if (id) return { platform: "youtube", embedId: id };
    return null;
  }

  // --- Twitch ---
  if (host === "twitch.tv" || host === "m.twitch.tv") {
    const vodMatch = url.pathname.match(/^\/videos\/(\d+)/);
    if (vodMatch?.[1]) return { platform: "twitch", embedId: `video:${vodMatch[1]}` };

    const channel = url.pathname.slice(1).split("/")[0];
    if (channel && !["directory", "settings", "downloads"].includes(channel)) {
      return { platform: "twitch", embedId: channel };
    }
    return null;
  }

  // --- Kick ---
  if (host === "kick.com") {
    // /video/UUID
    const videoMatch = url.pathname.match(/^\/video\/([^/?]+)/);
    if (videoMatch?.[1]) return { platform: "kick", embedId: `video:${videoMatch[1]}` };

    // /CHANNEL
    const channel = url.pathname.slice(1).split("/")[0];
    if (channel && !["categories", "following", "search"].includes(channel)) {
      return { platform: "kick", embedId: channel };
    }
    return null;
  }

  return null;
}
