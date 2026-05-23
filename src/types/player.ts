import type { Platform } from "../utils/parseUrl";

export interface PlayerData {
  id: string;
  platform: Platform;
  embedId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  volume: number;
  muted: boolean;
}

/** Interface exposta pelos embeds via forwardRef */
export interface PlayerControls {
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
}
