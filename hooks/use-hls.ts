"use client";

import { useEffect, useRef, useState } from "react";

export function isHlsUrl(url: string): boolean {
  return url.includes(".m3u8");
}

export interface HlsLevel {
  height: number;
  bitrate: number;
  index: number;
}

export interface Subtitle {
  label: string;
  src: string;
  lang: string;
  default?: boolean;
}

export interface UseHlsReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  hlsReady: boolean;
  levels: HlsLevel[];
  /** Index the user has selected. -1 = Auto (ABR). */
  selectedLevel: number;
  /** Index that is actually playing right now (updated on every level switch). */
  currentLevel: number;
  setLevel: (index: number) => void;
  subtitles: Subtitle[];
  currentSubtitle: number;
  setSubtitle: (index: number) => void;
  nativeHls: boolean;
}

export function useHls(src: string, subtitles: Subtitle[] = []): UseHlsReturn {
  const videoRef       = useRef<HTMLVideoElement>(null);
  const hlsRef         = useRef<import("hls.js").default | null>(null);
  const subtitlesRef   = useRef<Subtitle[]>(subtitles);

  const [hlsReady, setHlsReady]         = useState(false);
  const [levels, setLevels]             = useState<HlsLevel[]>([]);
  /** What the user explicitly chose. -1 = Auto. */
  const [selectedLevel, setSelectedLevel] = useState(-1);
  /** What is actually playing right now (from LEVEL_SWITCHED event). */
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [nativeHls, setNativeHls]       = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);

  subtitlesRef.current = subtitles;

  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
      setHlsReady(false);
      setLevels([]);
      setSelectedLevel(-1);
      setCurrentLevel(-1);
    }

    // Attach subtitle tracks
    video.querySelectorAll("track").forEach((t) => t.remove());
    subtitlesRef.current.forEach((sub, i) => {
      const track = document.createElement("track");
      track.kind    = "captions";
      track.label   = sub.label;
      track.srclang = sub.lang;
      track.src     = sub.src;
      if (sub.default) { track.default = true; setCurrentSubtitle(i); }
      video.appendChild(track);
    });

    if (!isHlsUrl(src)) {
      video.src = src;
      return;
    }

    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker:    true,
          lowLatencyMode:  false,
          backBufferLength: 90,

          // ── ABR (adaptive bitrate) settings ──────────────────────────
          startLevel:              -1,     // Auto on first load
          abrEwmaDefaultEstimate:  1_500_000, // 1.5 Mbps initial guess
          abrBandWidthFactor:      0.95,   // Use 95% of measured bandwidth
          abrBandWidthUpFactor:    0.7,    // Conservative quality upgrade
          abrEwmaFastLive:         3.0,    // Fast bandwidth estimator weight
          abrEwmaSlowLive:         9.0,    // Slow bandwidth estimator weight
          // ─────────────────────────────────────────────────────────────

          maxLoadingDelay:  4,
          maxBufferHole:    0.5,
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
          setLevels(data.levels.map((l, i) => ({ height: l.height, bitrate: l.bitrate, index: i })));
          setSelectedLevel(-1);
          setCurrentLevel(-1);
          setHlsReady(true);
        });

        // Fires every time the actual quality changes (including auto switches)
        hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
          setCurrentLevel(data.level);
        });

        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (!data.fatal) return;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else hls.destroy();
        });

        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // iOS Safari — native HLS, no level data available
        video.src = src;
        setNativeHls(true);
        setHlsReady(true);
      }
    });

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [src]);

  const setLevel = (index: number) => {
    if (!hlsRef.current) return;
    // index -1 = hand control back to ABR
    hlsRef.current.currentLevel = index;
    // When switching to auto, also reset nextLevel so ABR takes over immediately
    if (index === -1) hlsRef.current.nextLevel = -1;
    setSelectedLevel(index);
    // For manual selection also update currentLevel immediately for responsive UI
    if (index >= 0) setCurrentLevel(index);
  };

  const setSubtitle = (index: number) => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++)
      tracks[i].mode = i === index ? "showing" : "disabled";
    setCurrentSubtitle(index);
  };

  return {
    videoRef, hlsReady, levels,
    selectedLevel, currentLevel,
    setLevel,
    subtitles, currentSubtitle, setSubtitle,
    nativeHls,
  };
}
