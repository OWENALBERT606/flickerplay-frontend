"use client";

import type { Movie } from "@/actions/movies";
import { NetflixPlayer } from "@/components/front-end/netflix-player";

interface MoviePlayerProps {
  movie: Movie;
  userId?: string;
  initialProgress?: number;
}

export function MoviePlayer({ movie, userId, initialProgress = 0 }: MoviePlayerProps) {
  return (
    <div className="w-full bg-black">
      <NetflixPlayer
        src={movie.videoUrl}
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
      />
    </div>
  );
}
