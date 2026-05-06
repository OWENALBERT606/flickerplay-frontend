"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Volume2,
  VolumeX,
  Star,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Send,         // Telegram
  Link2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Movie } from "@/actions/movies";
import { AddToListButton } from "./add-to-list-button";
import { MoviePlayer } from "./movie-player";

/* ── Reddit SVG (not in lucide) ─────────────────────────────────── */
function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

/* ── WhatsApp SVG ────────────────────────────────────────────────── */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

interface MovieHeroProps {
  movie: Movie;
  userId?: string;
  initialProgress?: number;
}

const SOCIAL_PLATFORMS = [
  {
    name: "Facebook",
    icon: Facebook,
    color: "hover:bg-[#1877F2]",
    getUrl: (url: string, title: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Twitter / X",
    icon: Twitter,
    color: "hover:bg-[#1DA1F2]",
    getUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Watch "${title}" on FlickerPlay`)}`,
  },
  {
    name: "WhatsApp",
    icon: WhatsAppIcon,
    color: "hover:bg-[#25D366]",
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`Watch "${title}" on FlickerPlay: ${url}`)}`,
  },
  {
    name: "Telegram",
    icon: Send,
    color: "hover:bg-[#2CA5E0]",
    getUrl: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Watch "${title}" on FlickerPlay`)}`,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    color: "hover:bg-[#0A66C2]",
    getUrl: (url: string, title: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Reddit",
    icon: RedditIcon,
    color: "hover:bg-[#FF4500]",
    getUrl: (url: string, title: string) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
];

export function MovieHero({ movie, userId, initialProgress = 0 }: MovieHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [trailerReady, setTrailerReady] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  // Auto-play trailer muted on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !movie.trailerUrl) return;

    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay blocked — stay on poster
      });
    };

    video.addEventListener("canplay", () => {
      setTrailerReady(true);
      tryPlay();
    });

    return () => {
      video.pause();
    };
  }, [movie.trailerUrl]);

  // Close share panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShare(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/movies/${movie.slug}`
      : `/movies/${movie.slug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
      setShowShare(false);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const openShare = (getUrl: (u: string, t: string) => string) => {
    window.open(getUrl(shareUrl, movie.title), "_blank", "noopener,noreferrer,width=600,height=500");
    setShowShare(false);
  };

  // ── Full player mode ──────────────────────────────────────────────
  if (isPlaying) {
    return (
      <MoviePlayer
        movie={movie}
        userId={userId}
        initialProgress={initialProgress}
      />
    );
  }

  // ── Preview / hero mode ───────────────────────────────────────────
  const poster = movie.trailerPoster || movie.poster || movie.image;

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-black mt-14">
      {/* Hidden video preloader — starts buffering the movie while user reads the page */}
      {movie.videoUrl && (
        <video
          src={movie.videoUrl}
          preload="auto"
          className="hidden"
          aria-hidden="true"
        />
      )}
      {/* ── Background: trailer video or poster ── */}
      {movie.trailerUrl ? (
        <>
          {/* Poster shown until video is ready */}
          {!trailerReady && poster && (
            <Image
              src={poster}
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
          )}
          <video
            ref={videoRef}
            src={movie.trailerUrl}
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              trailerReady ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      ) : poster ? (
        <Image src={poster} alt={movie.title} fill className="object-cover" priority />
      ) : null}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />

      {/* ── Mute toggle (top-right, Netflix-style) ── */}
      {movie.trailerUrl && trailerReady && (
        <button
          onClick={toggleMute}
          className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full border border-white/40 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}

      {/* ── Content overlay ── */}
      <div className="absolute inset-0 flex items-end pb-10 px-6 md:px-12 lg:px-16">
        <div className="flex items-end gap-6 w-full max-w-5xl">

          {/* Poster thumbnail */}
          {poster && (
            <div className="hidden md:block shrink-0 w-32 rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <Image
                src={poster}
                alt={movie.title}
                width={128}
                height={192}
                className="object-cover w-full"
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg leading-tight">
              {movie.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-white">{movie.rating.toFixed(1)}</span>
                <span className="text-white/50">/10</span>
              </div>
              <span className="text-white/40">|</span>
              <span>{movie.year.value}</span>
              {movie.length && (
                <>
                  <span className="text-white/40">|</span>
                  <span>{movie.length}</span>
                </>
              )}
              <span className="text-white/40">|</span>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                {movie.genre.name}
              </Badge>
              {movie.vj?.name && (
                <>
                  <span className="text-white/40">|</span>
                  <span className="text-orange-400 text-xs">VJ {movie.vj.name}</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-white/80 text-sm leading-relaxed line-clamp-2 max-w-2xl">
              {movie.description}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Watch Now */}
              <Button
                size="lg"
                onClick={() => setIsPlaying(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                Watch Now
              </Button>

              {/* Add to list */}
              <AddToListButton
                itemId={movie.id}
                type="movie"
                userId={userId}
                variant="secondary"
                size="lg"
                showText
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm"
              />

              {/* Share */}
              <div className="relative" ref={shareRef}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowShare((s) => !s)}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>

                {/* Share panel */}
                {showShare && (
                  <div className="absolute bottom-full mb-3 left-0 z-50 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl min-w-[260px]">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white text-sm font-semibold">Share this movie</p>
                      <button
                        onClick={() => setShowShare(false)}
                        className="text-white/50 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Social icons */}
                    <div className="flex items-center gap-2 mb-3">
                      {SOCIAL_PLATFORMS.map(({ name, icon: Icon, color, getUrl }) => (
                        <button
                          key={name}
                          onClick={() => openShare(getUrl)}
                          title={name}
                          className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white transition-colors ${color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>

                    {/* Copy link */}
                    <button
                      onClick={copyLink}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-sm transition-colors"
                    >
                      <Link2 className="w-4 h-4 shrink-0" />
                      <span className="truncate">{shareUrl}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
