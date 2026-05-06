"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Detects whether a URL is an HLS manifest (.m3u8).
 */
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
  /** Attach this ref to your <video> element */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Whether HLS is actively loaded */
  hlsReady: boolean;
  /** Available quality levels (empty for native/MP4) */
  levels: HlsLevel[];
  /** Currently active level index (-1 = auto) */
  currentLevel: number;
  /** Set quality level (-1 = auto) */
  setLevel: (index: number) => void;
  /** Available subtitles */
  subtitles: Subtitle[];
  /** Current subtitle track index (-1 = off) */
  currentSubtitle: number;
  /** Set subtitle track */
  setSubtitle: (index: number) => void;
  /** Whether the browser supports HLS natively (Safari) */
  nativeHls: boolean;
}

/**
 * Attaches hls.js to a video element when the src is an HLS manifest.
 * Falls back to native playback for MP4 or Safari (which supports HLS natively).
 */
export function useHls(src: string, subtitles: Subtitle[] = []): UseHlsReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<import("hls.js").default | null>(null);
  const [hlsReady, setHlsReady] = useState(false);
  const [levels, setLevels] = useState<HlsLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [nativeHls, setNativeHls] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);

  // Stable ref for subtitles so array identity changes don't retrigger effects
  const subtitlesRef = useRef(subtitles);
  useEffect(() => { subtitlesRef.current = subtitles; }, [subtitles]);

  // Handle subtitle tracks — only re-run when src changes, use ref for subtitles
  useEffect(() => {
    const video = videoRef.current;
    const subs = subtitlesRef.current;
    if (!video || subs.length === 0) return;

    const existingTracks = video.querySelectorAll("track");
    existingTracks.forEach((track) => track.remove());

    subs.forEach((sub, index) => {
      const track = document.createElement("track");
      track.kind = "captions";
      track.label = sub.label;
      track.srclang = sub.lang;
      track.src = sub.src;
      if (sub.default) {
        track.default = true;
        setCurrentSubtitle(index);
      }
      video.appendChild(track);
    });
  }, [src]); // only src — subtitles accessed via ref

  // Subtitle switching handler
  const setSubtitle = (index: number) => {
    const video = videoRef.current;
    if (!video) return;

    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = i === index ? "showing" : "disabled";
    }
    setCurrentSubtitle(index);
  };

  useEffect(() => {
    if (!src) return;

    const video = videoRef.current;
    if (!video) return;

    // Destroy any previous hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
      setHlsReady(false);
      setLevels([]);
      setCurrentLevel(-1);
    }

    if (!isHlsUrl(src)) {
      // Plain MP4 — just set src directly
      video.src = src;
      return;
    }

    // Dynamic import so hls.js is only loaded client-side
    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          const qualityLevels: HlsLevel[] = data.levels.map((l, i) => ({
            height: l.height,
            bitrate: l.bitrate,
            index: i,
          }));
          setLevels(qualityLevels);
          setCurrentLevel(-1); // start on auto
          setHlsReady(true);
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          setCurrentLevel(data.level);
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS
        video.src = src;
        setNativeHls(true);
        setHlsReady(true);
      }
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]); // only src — subtitles accessed via ref

  const setLevel = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentLevel(index);
    }
  };

  return { videoRef, hlsReady, levels, currentLevel, setLevel, subtitles, currentSubtitle, setSubtitle, nativeHls };
}
