"use client";

import { useEffect, useRef, useState } from "react";

export function isHlsUrl(url: string): boolean {
  return url.includes(".m3u8") || url.includes(".ts");
}

/**
 * Browsers can't play raw .ts files natively.
 * Wrap a standalone .ts URL in a minimal HLS manifest so hls.js
 * handles the MPEG-TS demuxing — no server-side changes needed.
 */
function syntheticM3u8ForTs(tsUrl: string): string {
  const manifest = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    "#EXT-X-TARGETDURATION:99999",
    "#EXT-X-MEDIA-SEQUENCE:0",
    "#EXTINF:99999.0,",
    tsUrl,
    "#EXT-X-ENDLIST",
  ].join("\n");
  return `data:application/vnd.apple.mpegurl;base64,${btoa(manifest)}`;
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

    // Raw .ts files need a synthetic m3u8 wrapper — hls.js handles the TS demux
    const hlsSrc = src.includes(".ts") && !src.includes(".m3u8")
      ? syntheticM3u8ForTs(src)
      : src;

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

        hls.loadSource(hlsSrc);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
          setLevels(data.levels.map((l, i) => ({ height: l.height, bitrate: l.bitrate, index: i })));
          setSelectedLevel(-1);
          setCurrentLevel(-1);
          setHlsReady(true);
        });

        // For .ts files loaded as a single large HLS segment, the browser's native
        // `canplay` event may not fire until the whole file is downloaded.
        // hls.js FRAG_BUFFERED fires as soon as the first decoded chunk is appended
        // to the MSE buffer — dispatch canplay manually so the loading overlay clears.
        let firstFragBuffered = false;
        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          if (firstFragBuffered) return;
          firstFragBuffered = true;
          video.dispatchEvent(new Event("canplay"));
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
        // iOS Safari — native HLS. Use original src (TS files play natively on iOS).
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
