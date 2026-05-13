"use client";

import {
  useState, useEffect, useRef, useCallback, type KeyboardEvent,
} from "react";
import Link from "next/link";
import {
  Play, Pause, Volume2, VolumeX, Volume1,
  Maximize, Minimize, SkipBack, SkipForward,
  ArrowLeft, Loader2, RotateCcw, RotateCw,
  ChevronRight, SlidersHorizontal,
} from "lucide-react";
import { useHls } from "@/hooks/use-hls";
import { QualitySelector } from "@/components/front-end/quality-selector";
import { updateWatchProgress } from "@/actions/watchHistory";

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */

export interface NextItem {
  label: string;   // e.g. "S1 E2 · The Title"
  href: string;
}

export interface NetflixPlayerProps {
  /** Video source URL (.m3u8 or .mp4) */
  src: string;
  /** Poster image shown before play */
  poster?: string;
  /** Title shown top-left */
  title: string;
  /** Subtitle shown below title (e.g. "Season 1 · Episode 3") */
  subtitle?: string;
  /** Back-navigation href */
  backHref?: string;
  /** userId for progress tracking */
  userId?: string;
  /** itemId for progress tracking */
  itemId?: string;
  /** "movie" | "episode" */
  itemType?: "movie" | "episode";
  /** Resume from this percentage (0-100) */
  initialProgress?: number;
  /** Subtitles array */
  subtitles?: { label: string; src: string; lang: string }[];
  /** Next episode / related item */
  nextItem?: NextItem;
  /** Called when video ends */
  onEnded?: () => void;
  /** Auto-play on mount */
  autoPlay?: boolean;
  /** Show ads for free tier */
  showAds?: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

function fmt(s: number): string {
  if (!isFinite(s) || s < 0) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */

export function NetflixPlayer({
  src,
  poster,
  title,
  subtitle,
  backHref,
  userId,
  itemId,
  itemType = "movie",
  initialProgress = 0,
  subtitles: subtitlesProp = [],
  nextItem,
  onEnded,
  autoPlay = true,
  showAds = false,
}: NetflixPlayerProps) {
  /* ── state ── */
  const [playing, setPlaying]           = useState(false);
  const [muted, setMuted]               = useState(autoPlay); // start muted so browser allows autoplay
  const [volume, setVolume]             = useState(1);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [buffered, setBuffered]         = useState(0);
  const [buffering, setBuffering]       = useState(false);
  const [fullscreen, setFullscreen]     = useState(false);
  const [showUI, setShowUI]             = useState(true);
  const [seekHover, setSeekHover]       = useState<number | null>(null);
  const [seekHoverX, setSeekHoverX]     = useState(0);
  const [skipAnim, setSkipAnim]         = useState<"back" | "fwd" | null>(null);
  const [showNextCard, setShowNextCard] = useState(false);
  const [nextCountdown, setNextCountdown] = useState(5);
  const [subtitleIdx, setSubtitleIdx]   = useState(-1);
  const [showSubMenu, setShowSubMenu]   = useState(false);
  const [contrast, setContrast]         = useState(1);
  const [brightness, setBrightness]     = useState(1);
  const [showPicMenu, setShowPicMenu]   = useState(false);

  // Monetag Ad state
  const [adShown, setAdShown] = useState(true); // Default to true to avoid flash before effect

  // Ad state
  const [isAdPlaying, setIsAdPlaying] = useState(showAds);
  const [adCountdown, setAdCountdown] = useState(10);

  /* ── refs ── */
  const containerRef   = useRef<HTMLDivElement>(null);
  const seekBarRef     = useRef<HTMLDivElement>(null);
  const uiTimerRef     = useRef<NodeJS.Timeout | null>(null);
  const saveTimerRef   = useRef<number>(0);
  const nextTimerRef   = useRef<NodeJS.Timeout | null>(null);
  const skipAnimTimer  = useRef<NodeJS.Timeout | null>(null);

  /* ── HLS ── */
  const { videoRef, levels, currentLevel, setLevel } = useHls(src, subtitlesProp);

  /* ─────────────────────────────────────────────────────────────────────────
     Monetag Ad initialization
  ───────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const shown = sessionStorage.getItem("ad_shown");
      setAdShown(shown === "true");
    }
  }, []);

  /* ─────────────────────────────────────────────────────────────────────────
     Ads logic
  ───────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (isAdPlaying && adCountdown > 0) {
      const timer = setInterval(() => {
        setAdCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (adCountdown === 0) {
      setIsAdPlaying(false);
      // Resume or start video when ad ends
      if (videoRef.current && autoPlay) {
        videoRef.current.play().catch(() => {});
        setPlaying(true);
      }
    }
  }, [isAdPlaying, adCountdown]);

  /* ─────────────────────────────────────────────────────────────────────────
     Progress save
  ───────────────────────────────────────────────────────────────────────── */
  const saveProgress = useCallback(() => {
    if (!userId || !itemId || !videoRef.current || duration <= 0) return;
    updateWatchProgress(
      userId, itemId, itemType,
      Math.floor(videoRef.current.currentTime),
      Math.floor(duration),
    ).catch(console.error);
  }, [userId, itemId, itemType, duration, videoRef]);

  useEffect(() => () => { saveProgress(); }, [saveProgress]);

  /* ─────────────────────────────────────────────────────────────────────────
     UI auto-hide
  ───────────────────────────────────────────────────────────────────────── */
  const resetUITimer = useCallback(() => {
    setShowUI(true);
    if (uiTimerRef.current) clearTimeout(uiTimerRef.current);
    uiTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowUI(false);
    }, 3500);
  }, [videoRef]);

  /* ─────────────────────────────────────────────────────────────────────────
     Fullscreen listener
  ───────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* ─────────────────────────────────────────────────────────────────────────
     Keyboard shortcuts
  ───────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.code) {
        case "Space": case "KeyK": e.preventDefault(); togglePlay(); break;
        case "ArrowLeft":  case "KeyJ": e.preventDefault(); skip(-10); break;
        case "ArrowRight": case "KeyL": e.preventDefault(); skip(10);  break;
        case "ArrowUp":   e.preventDefault(); changeVolume(Math.min(1, volume + 0.1)); break;
        case "ArrowDown": e.preventDefault(); changeVolume(Math.max(0, volume - 0.1)); break;
        case "KeyM": toggleMute(); break;
        case "KeyF": toggleFullscreen(); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }); // intentionally no deps — always fresh closures

  /* ─────────────────────────────────────────────────────────────────────────
     Video event handlers
  ───────────────────────────────────────────────────────────────────────── */
  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    if (initialProgress > 0 && initialProgress < 95) {
      v.currentTime = (initialProgress / 100) * v.duration;
    }
    if (autoPlay && !isAdPlaying) {
      v.muted = true; // must be muted for browsers to allow autoplay
      setMuted(true);
      v.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (v.buffered.length > 0)
      setBuffered(v.buffered.end(v.buffered.length - 1));

    // Save every 10 s
    const now = Date.now();
    if (now - saveTimerRef.current >= 10_000) {
      saveTimerRef.current = now;
      saveProgress();
    }

    // Show "next" card 30 s before end
    if (nextItem && duration > 0 && duration - v.currentTime <= 30 && !showNextCard) {
      setShowNextCard(true);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    saveProgress();
    if (nextItem) {
      setNextCountdown(5);
      let c = 5;
      nextTimerRef.current = setInterval(() => {
        c -= 1;
        setNextCountdown(c);
        if (c <= 0) {
          clearInterval(nextTimerRef.current!);
          window.location.href = nextItem.href;
        }
      }, 1000);
    }
    onEnded?.();
  };

  /* ─────────────────────────────────────────────────────────────────────────
     Controls
  ───────────────────────────────────────────────────────────────────────── */
  const togglePlay = () => {
    if (isAdPlaying) return; // Prevent play during ad

    // Monetag Ad Trigger logic
    if (!adShown) {
      if (typeof window !== "undefined") {
        window.open("YOUR_MONETAG_DIRECT_LINK", "_blank");
        sessionStorage.setItem("ad_shown", "true");
        setAdShown(true);
        return; // Do NOT start video yet
      }
    }

    const v = videoRef.current;
    if (!v) return;

    if (v.paused) {
      // Small delay before playing after ad (as requested)
      setTimeout(() => {
        v.play().catch(() => {});
        setPlaying(true);
      }, 300);
    } else {
      v.pause();
      setPlaying(false);
      saveProgress();
    }
    resetUITimer();
  };

  const skip = (secs: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.currentTime + secs, duration));
    setSkipAnim(secs < 0 ? "back" : "fwd");
    if (skipAnimTimer.current) clearTimeout(skipAnimTimer.current);
    skipAnimTimer.current = setTimeout(() => setSkipAnim(null), 700);
    resetUITimer();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const changeVolume = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    setVolume(val);
    if (val === 0) { v.muted = true; setMuted(true); }
    else if (muted) { v.muted = false; setMuted(false); }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen();
  };

  /* ─────────────────────────────────────────────────────────────────────────
     Seek bar interaction
  ───────────────────────────────────────────────────────────────────────── */
  const handleSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = seekBarRef.current;
    if (!bar || !videoRef.current) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * duration;
    resetUITimer();
  };

  const handleSeekBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = seekBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setSeekHover(pct * duration);
    setSeekHoverX(e.clientX - rect.left);
  };

  /* ─────────────────────────────────────────────────────────────────────────
     Subtitle switching
  ───────────────────────────────────────────────────────────────────────── */
  const switchSubtitle = (idx: number) => {
    const v = videoRef.current;
    if (!v) return;
    const tracks = v.textTracks;
    for (let i = 0; i < tracks.length; i++)
      tracks[i].mode = i === idx ? "showing" : "disabled";
    setSubtitleIdx(idx);
    setShowSubMenu(false);
  };

  /* ─────────────────────────────────────────────────────────────────────────
     Volume icon
  ───────────────────────────────────────────────────────────────────────── */
  const VolumeIcon = muted || volume === 0 ? VolumeX
    : volume < 0.5 ? Volume1
    : Volume2;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  /* ─────────────────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black select-none"
      style={{ aspectRatio: fullscreen ? undefined : "16/9", height: fullscreen ? "100dvh" : undefined }}
      onMouseMove={resetUITimer}
      onMouseLeave={() => playing && setShowUI(false)}
      onTouchStart={resetUITimer}
    >
      {/* ── Video ── */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        style={{ filter: `contrast(${contrast}) brightness(${brightness})` }}
        poster={poster}
        preload="auto"
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onEnded={handleEnded}
        onClick={togglePlay}
      />

      {/* ── Buffering spinner ── */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-14 h-14 text-white animate-spin opacity-80" />
        </div>
      )}

      {/* ── Unmute nudge — shown when video autoplayed muted ── */}
      {muted && playing && (
        <div className="absolute bottom-20 left-4 z-50">
          <button
            onClick={toggleMute}
            className="flex items-center gap-2 bg-black/80 backdrop-blur-sm border border-white/20
              text-white text-sm px-4 py-2 rounded-full hover:bg-black transition-colors"
          >
            <VolumeX className="w-4 h-4" />
            <span>Tap to unmute</span>
          </button>
        </div>
      )}

      {/* ── Skip animation ── */}
      {skipAnim && (
        <div className={`absolute inset-y-0 flex items-center pointer-events-none
          ${skipAnim === "back" ? "left-[15%]" : "right-[15%]"}`}>
          <div className="flex flex-col items-center gap-1 animate-ping-once">
            {skipAnim === "back"
              ? <RotateCcw className="w-12 h-12 text-white/80" />
              : <RotateCw   className="w-12 h-12 text-white/80" />}
            <span className="text-white/80 text-sm font-semibold">
              {skipAnim === "back" ? "−10s" : "+10s"}
            </span>
          </div>
        </div>
      )}

      {/* ── Next episode card ── */}
      {showNextCard && nextItem && (
        <div className="absolute bottom-28 right-6 z-50 bg-black/90 border border-white/20
          rounded-xl p-4 w-64 shadow-2xl backdrop-blur-sm">
          <p className="text-white/60 text-xs mb-1">Up Next</p>
          <p className="text-white font-semibold text-sm mb-3 line-clamp-2">{nextItem.label}</p>
          <div className="flex items-center gap-2">
            <Link
              href={nextItem.href}
              className="flex-1 bg-white text-black text-sm font-semibold rounded-lg
                py-2 text-center hover:bg-white/90 transition-colors"
            >
              Play ({nextCountdown > 0 ? nextCountdown : "→"})
            </Link>
            <button
              onClick={() => { setShowNextCard(false); if (nextTimerRef.current) clearInterval(nextTimerRef.current); }}
              className="text-white/60 hover:text-white text-xs px-2 py-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          UI overlay — fades when playing + idle
      ══════════════════════════════════════════════════════════════ */}
      <div className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300
        ${showUI || !playing ? "opacity-100" : "opacity-0 pointer-events-none"}`}>

        {/* ── Top bar ── */}
        <div className="bg-gradient-to-b from-black/80 via-black/30 to-transparent px-4 md:px-8 pt-4 pb-12">
          <div className="flex items-center justify-between">
            {/* Back */}
            {backHref && (
              <Link href={backHref}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            )}

            {/* Title */}
            <div className="flex-1 text-center px-4">
              <p className="text-white font-semibold text-sm md:text-base line-clamp-1">{title}</p>
              {subtitle && (
                <p className="text-white/60 text-xs mt-0.5 line-clamp-1">{subtitle}</p>
              )}
            </div>

            {/* Spacer */}
            <div className="w-16" />
          </div>
        </div>

        {/* ── Centre play/pause tap area ── */}
        <div className="flex-1 flex items-center justify-center" onClick={togglePlay}>
          {!playing && !buffering && (
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20
              flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
              <Play className="w-10 h-10 fill-white text-white ml-1" />
            </div>
          )}
        </div>

        {/* ── Bottom controls ── */}
        <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 md:px-8 pb-4 pt-16">

          {/* Seek bar */}
          <div
            ref={seekBarRef}
            className="relative h-1 group/seek cursor-pointer mb-4"
            onClick={handleSeekBarClick}
            onMouseMove={handleSeekBarHover}
            onMouseLeave={() => setSeekHover(null)}
          >
            {/* Track */}
            <div className="absolute inset-0 bg-white/20 rounded-full" />
            {/* Buffered */}
            <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full transition-all"
              style={{ width: `${bufferedPct}%` }} />
            {/* Played */}
            <div className="absolute inset-y-0 left-0 bg-red-600 rounded-full transition-all"
              style={{ width: `${progress}%` }} />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full
                shadow-lg scale-0 group-hover/seek:scale-100 transition-transform"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
            {/* Hover time tooltip */}
            {seekHover !== null && (
              <div
                className="absolute -top-8 bg-black/90 text-white text-xs px-2 py-1 rounded
                  pointer-events-none -translate-x-1/2 whitespace-nowrap"
                style={{ left: seekHoverX }}
              >
                {fmt(seekHover)}
              </div>
            )}
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between gap-2">

            {/* Left controls */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Play/Pause */}
              <button onClick={togglePlay}
                className="text-white hover:text-white/80 transition-colors p-2">
                {playing
                  ? <Pause className="w-6 h-6 fill-white" />
                  : <Play  className="w-6 h-6 fill-white" />}
              </button>

              {/* Skip back */}
              <button onClick={() => skip(-10)}
                className="text-white hover:text-white/80 transition-colors p-2 hidden sm:block"
                title="−10s (J)">
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Skip forward */}
              <button onClick={() => skip(10)}
                className="text-white hover:text-white/80 transition-colors p-2 hidden sm:block"
                title="+10s (L)">
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1">
                <button onClick={toggleMute}
                  className="text-white hover:text-white/80 transition-colors p-2 flex-shrink-0">
                  <VolumeIcon className="w-5 h-5" />
                </button>
                <input
                  type="range" min={0} max={1} step={0.02}
                  value={muted ? 0 : volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  className="w-20 accent-white h-1 cursor-pointer hidden sm:block"
                />
              </div>

              {/* Time */}
              <span className="text-white/70 text-xs md:text-sm tabular-nums ml-1 hidden sm:block">
                {fmt(currentTime)} / {fmt(duration)}
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1 md:gap-2">

              {/* Subtitles */}
              {subtitlesProp.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSubMenu((s) => !s)}
                    className={`text-xs font-bold px-2 py-1 rounded border transition-colors
                      ${subtitleIdx >= 0
                        ? "border-white text-white bg-white/10"
                        : "border-white/40 text-white/60 hover:border-white hover:text-white"}`}
                    title="Subtitles">
                    CC
                  </button>
                  {showSubMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/95 border border-white/10
                      rounded-xl overflow-hidden min-w-[140px] shadow-2xl z-50">
                      <button
                        onClick={() => { switchSubtitle(-1); setShowSubMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                          ${subtitleIdx === -1 ? "text-red-500 font-semibold" : "text-white hover:bg-white/10"}`}>
                        Off
                      </button>
                      {subtitlesProp.map((s, i) => (
                        <button key={i}
                          onClick={() => { switchSubtitle(i); setShowSubMenu(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                            ${subtitleIdx === i ? "text-red-500 font-semibold" : "text-white hover:bg-white/10"}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quality */}
              <QualitySelector levels={levels} currentLevel={currentLevel} onSelect={setLevel} />

              {/* Next episode button */}
              {nextItem && (
                <Link href={nextItem.href}
                  className="hidden md:flex items-center gap-1 text-white/70 hover:text-white
                    text-xs border border-white/30 hover:border-white rounded px-2 py-1 transition-colors">
                  Next <ChevronRight className="w-3 h-3" />
                </Link>
              )}

              {/* Picture settings (contrast + brightness) */}
              <div className="relative">
                <button
                  onClick={() => setShowPicMenu((s) => !s)}
                  className={`transition-colors p-2 ${showPicMenu ? "text-white" : "text-white/60 hover:text-white"}`}
                  title="Picture settings">
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
                {showPicMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/95 border border-white/10
                    rounded-xl p-4 w-52 shadow-2xl z-50 space-y-4 backdrop-blur-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-white/70">
                        <span>Contrast</span>
                        <span>{Math.round(contrast * 100)}%</span>
                      </div>
                      <input
                        type="range" min={0.5} max={1.5} step={0.01}
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full accent-white h-1 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-white/70">
                        <span>Brightness</span>
                        <span>{Math.round(brightness * 100)}%</span>
                      </div>
                      <input
                        type="range" min={0.5} max={1.5} step={0.01}
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-white h-1 cursor-pointer"
                      />
                    </div>
                    <button
                      onClick={() => { setContrast(1); setBrightness(1); }}
                      className="w-full text-xs text-white/50 hover:text-white transition-colors text-center pt-1">
                      Reset
                    </button>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen}
                className="text-white hover:text-white/80 transition-colors p-2"
                title={fullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}>
                {fullscreen
                  ? <Minimize className="w-5 h-5" />
                  : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Overlay */}
      {isAdPlaying && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-6">
          <div className="space-y-6 max-w-md">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <span className="text-white font-bold text-xl">AD</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Experience FlickerPlay Premium</h2>
              <p className="text-gray-400">
                Watch all movies and series without ads, download unlimited content, and stream in 4K.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-sm text-gray-500">
                Ad will end in <span className="text-white font-mono font-bold">{adCountdown}s</span>
              </div>
              <Link 
                href="/checkout?plan=monthly"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Upgrade Now — 6,000 UGX
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
