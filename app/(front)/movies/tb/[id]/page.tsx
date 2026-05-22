import { notFound } from "next/navigation";
import { getTulabeMovie } from "@/actions/tulabe";
import { TbPlayer } from "./tb-player";
import { TbShareButton } from "./tb-share-button";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, Calendar, Layers } from "lucide-react";
import { cleanTitle } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const movie = await getTulabeMovie(id);
  if (!movie) return { title: "Movie Not Found" };
  return {
    title: cleanTitle(movie.title),
    description: `Watch ${cleanTitle(movie.title)} on FlickerPlay`,
    openGraph: {
      title: cleanTitle(movie.title),
      images: [{ url: movie.poster_url || movie.thumbnail_url }],
      type: "video.movie",
    },
  };
}

export default async function TbMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getTulabeMovie(id);
  if (!movie) notFound();

  const title = cleanTitle(movie.title);
  const durationMin = movie.duration_seconds > 0
    ? `${Math.round(movie.duration_seconds / 60)} min`
    : null;
  const viewsFormatted =
    movie.view_count >= 1_000_000
      ? `${(movie.view_count / 1_000_000).toFixed(1)}M`
      : movie.view_count >= 1_000
      ? `${(movie.view_count / 1_000).toFixed(1)}K`
      : String(movie.view_count || 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Player ── */}
      <TbPlayer movie={movie} />

      {/* ── Detail section ── */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left: title + info ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Title & meta */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {movie.release_year > 0 && (
                  <>
                    <span className="text-gray-300">{movie.release_year}</span>
                    <span className="text-gray-400">•</span>
                  </>
                )}
                {durationMin && (
                  <>
                    <span className="text-gray-300">{durationMin}</span>
                    <span className="text-gray-400">•</span>
                  </>
                )}
                {movie.genre_names ? (
                  <Badge variant="outline" className="border-orange-500/30 text-orange-500">
                    {movie.genre_names}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-orange-500/30 text-orange-500">
                    Movie
                  </Badge>
                )}
                {movie.qualities?.length > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    {movie.qualities.map((q) => (
                      <Badge
                        key={q.quality}
                        className="bg-orange-500/20 text-orange-400 border-0 text-xs"
                      >
                        {q.quality}
                      </Badge>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Share button */}
            <TbShareButton title={title} />

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Views</span>
                </div>
                <p className="text-2xl font-bold text-white">{viewsFormatted}</p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Duration</span>
                </div>
                <p className="text-2xl font-bold text-white">{durationMin || "N/A"}</p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Release Year</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {movie.release_year > 0 ? movie.release_year : "N/A"}
                </p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Layers className="w-4 h-4" />
                  <span className="text-sm">Quality</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {movie.qualities?.length > 0
                    ? movie.qualities.map((q) => q.quality).join(" / ")
                    : "HD"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-6">
            {/* Source card */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">SC1</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  TX
                </div>
                <div>
                  <p className="text-white font-medium">SC1</p>
                </div>
              </div>
            </div>

            {/* Genre card */}
            {movie.genre_names && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Genre</h3>
                <p className="text-white font-medium">{movie.genre_names}</p>
              </div>
            )}

            {/* Qualities card */}
            {movie.qualities?.length > 0 && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Available in</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.qualities.map((q) => (
                    <span
                      key={q.quality}
                      className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-md font-medium"
                    >
                      {q.quality}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

