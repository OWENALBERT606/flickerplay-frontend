"use client";

import type { Movie } from "@/actions/movies";
import { TrailerPlayer } from "@/components/front-end/trailer-player";

interface MovieTrailerProps {
  movie: Movie;
}

export function MovieTrailer({ movie }: MovieTrailerProps) {
  if (!movie.trailerUrl) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Trailer</h2>
      <TrailerPlayer
        url={movie.trailerUrl}
        title={`${movie.title} Trailer`}
        poster={movie.trailerPoster || movie.poster || movie.image}
      />
    </div>
  );
}
