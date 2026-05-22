"use client";

import { useState } from "react";
import { NetflixPlayer } from "@/components/front-end/netflix-player";
import type { TulabeMovie } from "@/actions/tulabe";

interface TulabePlayerProps {
  movie: TulabeMovie;
}

export function TulabePlayer({ movie }: TulabePlayerProps) {
  const qualities = movie.qualities?.filter((q) => q.stream_url || q.playlist_url) || [];
  const [selectedQuality, setSelectedQuality] = useState<string>(
    qualities.find((q) => q.quality === "720p")?.quality || qualities[0]?.quality || ""
  );

  const currentStream =
    qualities.find((q) => q.quality === selectedQuality)?.stream_url ||
    qualities.find((q) => q.quality === selectedQuality)?.playlist_url ||
    movie.stream_url;

  return (
    <div className="w-full bg-black">
      {qualities.length > 1 && (
        <div className="flex justify-end gap-2 px-4 py-2 bg-black/80">
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
        title={movie.title}
        subtitle={[
          movie.release_year > 0 ? String(movie.release_year) : null,
          movie.genre_names || null,
        ]
          .filter(Boolean)
          .join(" · ")}
        backHref={`/movies`}
        autoPlay
      />
    </div>
  );
}
