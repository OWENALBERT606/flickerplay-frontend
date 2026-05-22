import { notFound } from "next/navigation";
import { getTulabeMovie } from "@/actions/tulabe";
import { TulabePlayer } from "./tulabe-player";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const movie = await getTulabeMovie(id);
  if (!movie) return { title: "Movie Not Found" };
  return {
    title: movie.title,
    description: `Watch ${movie.title} on FlickerPlay`,
    openGraph: {
      title: movie.title,
      images: [{ url: movie.poster_url || movie.thumbnail_url }],
      type: "video.movie",
    },
  };
}

export default async function TulabeMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getTulabeMovie(id);

  if (!movie) notFound();

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Player */}
      <TulabePlayer movie={movie} />

      {/* Movie info */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {(movie.poster_url || movie.thumbnail_url) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={movie.poster_url || movie.thumbnail_url}
              alt={movie.title}
              className="w-40 h-60 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{movie.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-4">
              {movie.release_year > 0 && <span>{movie.release_year}</span>}
              {movie.genre_names && <span>• {movie.genre_names}</span>}
              {movie.duration_seconds > 0 && (
                <span>• {Math.round(movie.duration_seconds / 60)} min</span>
              )}
            </div>
            {movie.qualities?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {movie.qualities.map((q) => (
                  <span
                    key={q.quality}
                    className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded font-medium"
                  >
                    {q.quality}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
