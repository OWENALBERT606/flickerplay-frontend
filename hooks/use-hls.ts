"use client";

import { useEffect, useRef, useState } from "react";

export function isHlsUrl(url: string): boolean {
  return url.includes(".m3u8");
}

export function isTsUrl(url: string): boolean {
  // Match .ts at end of path or before query string
  return /\.ts(\?|$)/.test(url);
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
  selectedLevel: number;
  currentLevel: number;
  setLevel: (index: number) => void;
  subtitles: Subtitle[];
  currentSubtitle: number;
  setSubtitle: (index: number) => void;
  nativeHls: boolean;
}

export function useHls(src: string, subtitles: Subtitle[] = []): UseHlsReturn {
  const videoRef     = useRef<HTMLVideoElement>(null);
  const hlsRef       = useRef<import("hls.js").default | null>(null);
  const mpegtsRef    = useRef<any>(null);
  const subtitlesRef = useRef<Subtitle[]>(subtitles);

  const [hlsReady, setHlsReady]             = useState(false);
  const [levels, setLevels]                 = useState<HlsLevel[]>([]);
  const [selectedLevel, setSelectedLevel]   = useState(-1);
  const [currentLevel, setCurrentLevel]     = useState(-1);
  const [nativeHls, setNativeHls]           = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);

  subtitlesRef.current = subtitles;

  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    // ── Teardown any previous player ──────────────────────────────────────────
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (mpegtsRef.current) {
      mpegtsRef.current.destroy();
      mpegtsRef.current = null;
    }
    video.removeAttribute("src");
    video.load();
    setHlsReady(false);
    setLevels([]);
    setSelectedLevel(-1);
    setCurrentLevel(-1);

    // ── Subtitle tracks ───────────────────────────────────────────────────────
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

    // ── .ts file → mpegts.js ─────────────────────────────────────────────────
    if (isTsUrl(src)) {
      import("mpegts.js").then(({ default: mpegts }) => {
        if (!mpegts.isSupported()) {
          // MSE not available — try direct src as last resort
          video.src = src;
          return;
        }

        const player = mpegts.createPlayer(
          {
            type: "mpegts",
            url: src,
            isLive: false,
            cors: true,
          },
          {
            enableWorker: true,
            lazyLoad: false,
            lazyLoadMaxDuration: 3 * 60,
            seekType: "range",
            reuseRedirectedURL: true,
          }
        );

        player.attachMediaElement(video);
        player.load();

        player.on(mpegts.Events.MEDIA_INFO, () => {
          setHlsReady(true);
        });

        player.on(mpegts.Events.ERROR, (errType: any, errDetail: any) => {
          console.error("[mpegts] error:", errType, errDetail);
        });

        mpegtsRef.current = player;
      });

      return () => {
        if (mpegtsRef.current) {
          mpegtsRef.current.destroy();
          mpegtsRef.current = null;
        }
      };
    }

    // ── .m3u8 → hls.js ───────────────────────────────────────────────────────
    if (isHlsUrl(src)) {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker:          true,
            lowLatencyMode:        false,
            backBufferLength:      90,
            startLevel:            -1,
            abrEwmaDefaultEstimate: 1_500_000,
            abrBandWidthFactor:    0.95,
            abrBandWidthUpFactor:  0.7,
            maxLoadingDelay:       4,
            maxBufferHole:         0.5,
          });

          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
            setLevels(data.levels.map((l, i) => ({ height: l.height, bitrate: l.bitrate, index: i })));
            setSelectedLevel(-1);
            setCurrentLevel(-1);
            setHlsReady(true);
          });

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
          video.src = src;
          setNativeHls(true);
          setHlsReady(true);
        }
      });

      return () => {
        if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      };
    }

    // ── Plain file (.mp4, .webm, etc.) ────────────────────────────────────────
    video.src = src;
  }, [src]);

  const setLevel = (index: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = index;
    if (index === -1) hlsRef.current.nextLevel = -1;
    setSelectedLevel(index);
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
