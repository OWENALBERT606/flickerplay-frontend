"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { HlsLevel } from "@/hooks/use-hls";

interface QualitySelectorProps {
  levels: HlsLevel[];
  currentLevel: number;
  onSelect: (index: number) => void;
}

function labelFor(level: HlsLevel): string {
  if (level.height >= 2160) return "4K";
  if (level.height >= 1080) return "1080p";
  if (level.height >= 720) return "720p";
  if (level.height >= 480) return "480p";
  if (level.height >= 360) return "360p";
  return `${level.height}p`;
}

export function QualitySelector({ levels, currentLevel, onSelect }: QualitySelectorProps) {
  const [open, setOpen] = useState(false);

  if (levels.length === 0) return null;

  const activeLabel =
    currentLevel === -1
      ? "Auto"
      : labelFor(levels[currentLevel] ?? levels[0]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="text-white hover:bg-white/10 flex items-center gap-1 text-xs px-2"
        title="Quality"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">{activeLabel}</span>
      </Button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/10 rounded-lg overflow-hidden min-w-[100px] z-50">
          {/* Auto option */}
          <button
            className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
              currentLevel === -1 ? "text-orange-400 font-semibold" : "text-white"
            }`}
            onClick={() => {
              onSelect(-1);
              setOpen(false);
            }}
          >
            Auto
          </button>

          {/* Quality levels — highest first */}
          {[...levels]
            .sort((a, b) => b.height - a.height)
            .map((level) => (
              <button
                key={level.index}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                  currentLevel === level.index
                    ? "text-orange-400 font-semibold"
                    : "text-white"
                }`}
                onClick={() => {
                  onSelect(level.index);
                  setOpen(false);
                }}
              >
                {labelFor(level)}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
