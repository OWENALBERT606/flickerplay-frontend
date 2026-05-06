"use client";

import { Captions } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Subtitle } from "@/hooks/use-hls";

interface SubtitleSelectorProps {
  subtitles: Subtitle[];
  currentSubtitle: number;
  onSelect: (index: number) => void;
}

export function SubtitleSelector({ subtitles, currentSubtitle, onSelect }: SubtitleSelectorProps) {
  const [open, setOpen] = useState(false);

  if (subtitles.length === 0) return null;

  const activeLabel =
    currentSubtitle === -1 ? "CC Off" : subtitles[currentSubtitle]?.label || "CC";

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="text-white hover:bg-white/10 flex items-center gap-1 text-xs px-2"
        title="Subtitles"
      >
        <Captions className="w-4 h-4" />
        <span className="hidden sm:inline">{activeLabel}</span>
      </Button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/10 rounded-lg overflow-hidden min-w-[120px] z-50">
          {/* Off option */}
          <button
            className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
              currentSubtitle === -1 ? "text-orange-400 font-semibold" : "text-white"
            }`}
            onClick={() => {
              onSelect(-1);
              setOpen(false);
            }}
          >
            Off
          </button>

          {/* Subtitle options */}
          {subtitles.map((sub, index) => (
            <button
              key={index}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                currentSubtitle === index
                  ? "text-orange-400 font-semibold"
                  : "text-white"
              }`}
              onClick={() => {
                onSelect(index);
                setOpen(false);
              }}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}