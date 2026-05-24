"use client";

import { NetflixPlayer } from "@/components/front-end/netflix-player";
import { cleanTitle } from "@/lib/utils";
import type { LabaMovie } from "@/actions/labafilm";

export function LbPlayer({ movie }: { movie: LabaMovie }) {
  // labacdn.xyz requires Referer: labafilm.com — proxy handles that.
  // HLS streams go through tx-proxy; MP4s through laba-video (streaming Range proxy).
  const src = movie.video
    ? movie.video.includes(".m3u8")
      ? `/api/tx-proxy?url=${encodeURIComponent(movie.video)}`
      : `/api/laba-video?url=${encodeURIComponent(movie.video)}`
    : "";
  const year =
    movie.year ??
    (movie.release_date ? movie.release_date.substring(0, 4) : "");
  const subtitle = [year, movie.genres?.join(", ") || ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="w-full bg-black">
      <NetflixPlayer
        src={src}
        poster={movie.poster}
        title={cleanTitle(movie.title)}
        subtitle={subtitle}
        backHref="/movies"
        autoPlay
      />
    </div>
  );
}
