"use client";

import { useEffect } from "react";

// Known Smart TV user-agent signatures
const TV_UA = [
  /SMART-?TV/i, /SmartTV/i,
  /Tizen/i,               // Samsung
  /Web0S/i, /webOS/i,    // LG
  /GoogleTV/i, /CrKey/i, // Google / Chromecast
  /Android.*TV/i, /TV.*Android/i,
  /FireTV/i, /Silk.*accelerated/i, // Amazon Fire TV
  /PhilipsTV/i, /HisenseTV/i, /VIDAA/i,
  /Roku/i,
  /AppleTV/i, /tvOS/i,
];

function detectTV(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (TV_UA.some((p) => p.test(ua))) return true;
  // Heuristic: large screen with no pointer (most Smart TVs report coarse or no pointer)
  if (typeof window !== "undefined") {
    const noFinePointer = !window.matchMedia("(pointer: fine)").matches;
    const bigScreen = window.screen.width >= 1280 && window.screen.height >= 720;
    if (noFinePointer && bigScreen && !/Mobile|Tablet|iPad|iPhone|Android/i.test(ua)) return true;
  }
  return false;
}

export function TVSupport() {
  useEffect(() => {
    const isTV = detectTV();
    if (isTV) {
      document.documentElement.setAttribute("data-tv", "true");
    }

    // TV remote back button: Backspace, GoBack, BrowserBack, Escape (when NOT in a modal)
    const handleBack = (e: KeyboardEvent) => {
      const key = e.key;
      if (key !== "Backspace" && key !== "GoBack" && key !== "BrowserBack") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      window.history.back();
    };

    // Media keys: play/pause, fast-forward, rewind — dispatched as synthetic events
    // so the video player's keydown handler picks them up naturally.
    const handleMedia = (e: KeyboardEvent) => {
      const map: Record<string, string> = {
        MediaPlay:        "KeyK",
        MediaPause:       "KeyK",
        MediaPlayPause:   "KeyK",
        MediaStop:        "KeyK",
        MediaFastForward: "KeyL",
        MediaRewind:      "KeyJ",
        MediaTrackNext:   "KeyL",
        MediaTrackPrevious: "KeyJ",
      };
      const mapped = map[e.key];
      if (!mapped) return;
      e.preventDefault();
      window.dispatchEvent(new KeyboardEvent("keydown", { code: mapped, bubbles: true }));
    };

    window.addEventListener("keydown", handleBack);
    window.addEventListener("keydown", handleMedia);
    return () => {
      window.removeEventListener("keydown", handleBack);
      window.removeEventListener("keydown", handleMedia);
    };
  }, []);

  return null;
}
