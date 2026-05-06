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
  const [hlsReady, setHlsReady]           = useState(false);
  const [levels, setLevels]               = useState<HlsLevel[]>([]);
  const [currentLevel, setCurrentLevel]   = useState(-1);
  const [nativeHls, setNativeHls]         = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);

  // Keep subtitles ref up to date without triggering re-runs
  subtitlesRef.current = subtitles;

  /* ── Main effect — only re-runs when src changes ── */
  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    // Tear down previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
      setHlsReady(false);
      setLevels([]);
      setCurrentLevel(-1);
    }

    // Attach subtitle tracks
    const subs = subtitlesRef.current;
    video.querySelectorAll("track").forEach((t) => t.remove());
    subs.forEach((sub, i) => {
      const track = document.createElement("track");
      track.kind    = "captions";
      track.label   = sub.label;
      track.srclang = sub.lang;
      track.src     = sub.src;
      if (sub.default) { track.default = true; setCurrentSubtitle(i); }
      video.appendChild(track);
    });

    // Plain MP4 — set src directly
    if (!isHlsUrl(src)) {
      video.src = src;
      return;
    }

    // HLS — dynamic import (client-only)
    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker:    true,
          lowLatencyMode:  false,
          backBufferLength: 90,
        });
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
          setLevels(data.levels.map((l, i) => ({ height: l.height, bitrate: l.bitrate, index: i })));
          setCurrentLevel(-1);
          setHlsReady(true);
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => setCurrentLevel(data.level));
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (!data.fatal) return;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else hls.destroy();
        });

        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        setNativeHls(true);
        setHlsReady(true);
      }
    });

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [src]); // ← ONLY src — never subtitles

  const setLevel = (index: number) => {
    if (hlsRef.current) { hlsRef.current.currentLevel = index; setCurrentLevel(index); }
  };

  const setSubtitle = (index: number) => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++)
      tracks[i].mode = i === index ? "showing" : "disabled";
    setCurrentSubtitle(index);
  };

  return { videoRef, hlsReady, levels, currentLevel, setLevel, subtitles, currentSubtitle, setSubtitle, nativeHls };
}
