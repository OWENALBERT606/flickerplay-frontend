"use client";

import { useState } from "react";
import { NetflixPlayer } from "@/components/front-end/netflix-player";
import { cleanTitle } from "@/lib/utils";
import type { TulabeMovie } from "@/actions/tulabe";

/**
 * Rewrite a scraper proxy URL (http://localhost:3003/api/proxy?url=X)
 * to the Next.js tx-proxy (same origin). Falls back to direct backblaze
 * playlist_url if present, otherwise uses the scraper stream_url as-is.
 */
function toLocalStream(scraperUrl: string, playlistUrl?: string): string {
  // Prefer the direct backblaze URL (no localhost dependency)
  const backblaze = playlistUrl || extractBackblazeUrl(scraperUrl);
  if (backblaze) return `/api/tx-proxy?url=${encodeURIComponent(backblaze)}`;
  return scraperUrl;
}

function extractBackblazeUrl(url: string): string | null {
  try {
    const match = url.match(/[?&]url=(.+?)(?:&|$)/);
    if (match) return decodeURIComponent(match[1]);
  } catch {}
  return null;
}

export function TbPlayer({ movie }: { movie: TulabeMovie }) {
  const qualities = movie.qualities?.filter((q) => q.stream_url || q.playlist_url) || [];
  const [selectedQuality, setSelectedQuality] = useState<string>(
    qualities.find((q) => q.quality === "720p")?.quality || qualities[0]?.quality || ""
  );

  const selected = qualities.find((q) => q.quality === selectedQuality);
  const currentStream = toLocalStream(
    selected?.stream_url || movie.stream_url,
    selected?.playlist_url
  );

  const displayTitle = cleanTitle(movie.title);
  const subtitle = [
    movie.release_year > 0 ? String(movie.release_year) : null,
    movie.genre_names || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="w-full bg-black">
      {qualities.length > 1 && (
        <div className="flex justify-end gap-2 px-4 py-2 bg-gray-900/80">
          {qualities.map((q) => (
            <button
              key={q.quality}
              onClick={() => setSelectedQuality(q.quality)}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                selectedQuality === q.quality
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {q.quality}
            </button>
          ))}
        </div>
      )}
      <NetflixPlayer
        src={currentStream}
        poster={movie.poster_url || movie.thumbnail_url}
        title={displayTitle}
        subtitle={subtitle}
        backHref="/movies"
        autoPlay
      />
    </div>
  );
}
