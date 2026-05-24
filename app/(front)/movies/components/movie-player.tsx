"use client";

import type { Movie } from "@/actions/movies";
import { NetflixPlayer } from "@/components/front-end/netflix-player";
import { FreeTierBanner } from "@/components/front-end/free-tier-banner";
import { useEffect, useState } from "react";
import { GuestWatchManager } from "@/lib/guest-watch-manager";
import { Loader2 } from "lucide-react";

interface MoviePlayerProps {
  movie: Movie;
  userId?: string;
  initialProgress?: number;
  showAds?: boolean;
  moviesWatchedThisMonth?: number;
  isGuest?: boolean;
}

export function MoviePlayer({
  movie,
  userId,
  initialProgress = 0,
  showAds = false,
  moviesWatchedThisMonth = 0,
  isGuest = false,
}: MoviePlayerProps) {
  // Movies with source="labafilm" still have old labacdn.xyz URLs (not yet migrated to R2).
  // For those, fetch a fresh signed token URL from our server.
  // Once all videos are uploaded to R2, source becomes null and videoUrl is a direct CDN URL.
  const needsToken = movie.source === "labafilm";
  const [streamUrl, setStreamUrl] = useState<string | null>(needsToken ? null : movie.videoUrl);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (isGuest) GuestWatchManager.addWatchedMovie(movie.id);
  }, [isGuest, movie.id]);

  useEffect(() => {
    if (!needsToken || !movie.externalId) return;
    fetch(`/api/stream-token?id=${encodeURIComponent(movie.externalId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.streamUrl) setStreamUrl(data.streamUrl);
        else setTokenError(true);
      })
      .catch(() => setTokenError(true));
  }, [needsToken, movie.externalId]);

  if (needsToken && streamUrl === null && !tokenError) {
    return (
      <div className="w-full bg-black flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
        <Loader2 className="w-10 h-10 text-white animate-spin opacity-60" />
      </div>
    );
  }

  if (!streamUrl || tokenError) {
    return (
      <div className="w-full bg-black flex flex-col items-center justify-center gap-3 text-white/60" style={{ aspectRatio: "16/9" }}>
        <p className="text-sm">Video not available.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-black">
      {showAds && <FreeTierBanner moviesWatched={moviesWatchedThisMonth} />}
      <NetflixPlayer
        src={streamUrl}
        poster={movie.poster || movie.image}
        title={movie.title}
        subtitle={`${movie.year.value} · ${movie.genre.name}${movie.length ? ` · ${movie.length}` : ""}`}
        backHref={`/movies/${movie.slug}`}
        userId={userId}
        itemId={movie.id}
        itemType="movie"
        initialProgress={initialProgress}
        subtitles={movie.subtitles || []}
        autoPlay
        showAds={showAds}
      />
    </div>
  );
}
