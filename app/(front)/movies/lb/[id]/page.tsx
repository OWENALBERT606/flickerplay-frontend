import { notFound } from "next/navigation";
import { getLabaMovie } from "@/actions/labafilm";
import { LbPlayer } from "./lb-player";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Globe } from "lucide-react";
import { cleanTitle } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const movie = await getLabaMovie(id);
  if (!movie) return { title: "Movie Not Found" };
  return {
    title: cleanTitle(movie.title),
    description:
      movie.overview || `Watch ${cleanTitle(movie.title)} on FlickerPlay`,
    openGraph: {
      title: cleanTitle(movie.title),
      images: [{ url: movie.poster }],
      type: "video.movie",
    },
  };
}

export default async function LbMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getLabaMovie(id);
  if (!movie) notFound();

  const title = cleanTitle(movie.title);
  const year =
    movie.year ??
    (movie.release_date
      ? parseInt(movie.release_date.substring(0, 4), 10)
      : null);

  return (
    <div className="min-h-screen bg-black text-white">
      <LbPlayer movie={movie} />

      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: title + info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {year && (
                  <>
                    <span className="text-gray-300">{year}</span>
                    <span className="text-gray-400">•</span>
                  </>
                )}
                {movie.genres?.length > 0 && (
                  <Badge
                    variant="outline"
                    className="border-orange-500/30 text-orange-500"
                  >
                    {movie.genres.join(", ")}
                  </Badge>
                )}
                {(movie.rating ?? 0) > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs">
                      ⭐ {(movie.rating ?? 0).toFixed(1)}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {movie.overview && (
              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {year && (
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Year</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{year}</p>
                </div>
              )}
              {movie.rating > 0 && (
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {movie.rating.toFixed(1)}
                  </p>
                </div>
              )}
              {movie.country && (
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Country</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {movie.country}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {movie.vj && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">VJ</h3>
                <p className="text-white font-medium">{movie.vj}</p>
              </div>
            )}
            {movie.director && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  Director
                </h3>
                <p className="text-white font-medium">{movie.director}</p>
              </div>
            )}
            {movie.genres?.length > 0 && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-md font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {movie.company && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  Studio
                </h3>
                <p className="text-white font-medium">{movie.company}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
