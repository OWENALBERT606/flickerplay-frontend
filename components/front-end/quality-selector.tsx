"use client";

import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { HlsLevel } from "@/hooks/use-hls";

interface QualitySelectorProps {
  levels: HlsLevel[];
  /** Index the user selected (-1 = Auto). */
  selectedLevel: number;
  /** Index actually playing right now. */
  currentLevel: number;
  onSelect: (index: number) => void;
}

function labelFor(level: HlsLevel): string {
  if (level.height >= 2160) return "4K";
  if (level.height >= 1440) return "1440p";
  if (level.height >= 1080) return "1080p HD";
  if (level.height >= 720)  return "720p HD";
  if (level.height >= 480)  return "480p";
  if (level.height >= 360)  return "360p";
  return `${level.height}p`;
}

function shortLabel(level: HlsLevel): string {
  if (level.height >= 2160) return "4K";
  if (level.height >= 1440) return "1440p";
  if (level.height >= 1080) return "1080p";
  if (level.height >= 720)  return "720p";
  if (level.height >= 480)  return "480p";
  if (level.height >= 360)  return "360p";
  return `${level.height}p`;
}

export function QualitySelector({ levels, selectedLevel, currentLevel, onSelect }: QualitySelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (levels.length === 0) return null;

  const isAuto = selectedLevel === -1;
  const playingLevel = levels[currentLevel] ?? null;

  // Button label: "Auto · 720p" in auto mode, or "1080p" when manually selected
  const btnLabel = isAuto
    ? playingLevel ? `Auto · ${shortLabel(playingLevel)}` : "Auto"
    : shortLabel(levels[selectedLevel] ?? levels[0]);

  const sortedLevels = [...levels].sort((a, b) => b.height - a.height);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-white hover:text-white/80 transition-colors px-2 py-1.5 rounded hover:bg-white/10 text-xs font-medium"
        title="Video quality"
      >
        <Settings className={`w-4 h-4 shrink-0 ${open ? "text-orange-400" : ""}`} />
        <span className="hidden sm:inline whitespace-nowrap">{btnLabel}</span>
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-black/95 border border-white/10 rounded-xl overflow-hidden min-w-[160px] shadow-2xl z-50 backdrop-blur-sm">
          <div className="px-3 py-2 border-b border-white/10">
            <p className="text-xs text-white/50 font-medium uppercase tracking-wider">Quality</p>
          </div>

          {/* Auto */}
          <button
            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-white/10 ${
              isAuto ? "text-orange-400" : "text-white"
            }`}
            onClick={() => { onSelect(-1); setOpen(false); }}
          >
            <span className="font-medium">Auto</span>
            <span className="text-xs text-white/40 ml-4">
              {isAuto && playingLevel ? shortLabel(playingLevel) : "Adaptive"}
            </span>
          </button>

          <div className="border-t border-white/5" />

          {/* Manual levels — highest first */}
          {sortedLevels.map((level) => {
            const active = !isAuto && selectedLevel === level.index;
            const isPlaying = currentLevel === level.index;
            return (
              <button
                key={level.index}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-white/10 ${
                  active ? "text-orange-400" : "text-white"
                }`}
                onClick={() => { onSelect(level.index); setOpen(false); }}
              >
                <span className="font-medium">{labelFor(level)}</span>
                <span className="text-xs text-white/40 ml-4 flex items-center gap-1.5">
                  {/* dot indicator when this level is currently playing (even in auto mode) */}
                  {isPlaying && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" title="Currently playing" />
                  )}
                  {(level.bitrate / 1000).toFixed(0)}k
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
