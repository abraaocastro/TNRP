import { useCallback } from "react";

interface AudioControlsProps {
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMutedChange: (muted: boolean) => void;
}

export function AudioControls({
  volume,
  muted,
  onVolumeChange,
  onMutedChange,
}: AudioControlsProps) {
  const handleToggleMute = useCallback(() => {
    onMutedChange(!muted);
  }, [muted, onMutedChange]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      onVolumeChange(val);
    },
    [onVolumeChange],
  );

  const displayVolume = muted ? 0 : volume;

  const volumeIcon = muted || volume === 0 ? "🔇" : volume < 40 ? "🔈" : volume < 75 ? "🔉" : "🔊";

  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <button
        onClick={handleToggleMute}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm transition-colors hover:bg-slate-700"
        title={muted ? "Ativar som" : "Mutar"}
      >
        {volumeIcon}
      </button>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={displayVolume}
        onChange={handleSliderChange}
        className="tnrp-volume-slider h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-slate-600"
        title={`Volume: ${displayVolume}%`}
      />

      <span className="w-8 text-right text-xs tabular-nums text-slate-400">
        {displayVolume}
      </span>
    </div>
  );
}
