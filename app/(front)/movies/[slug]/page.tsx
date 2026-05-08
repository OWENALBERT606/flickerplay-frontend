
import { getMovieBySlug, listMovies, incrementMovieViews } from "@/actions/movies";
import { notFound } from "next/navigation";
import { MovieDetails } from "../components/movie-details";
import { MovieTrailer } from "../components/movie-trailer";
import { RelatedMovies } from "../components/related-movies";
import { getSession } from "@/actions/auth";
import { MoviePlayer } from "../components/movie-player";
import { getWatchProgress } from "@/actions/watchHistory";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const movieData = await getMovieBySlug(slug);
  const movie = movieData.data;

  if (!movie) {
    return { title: "Movie Not Found" };
  }

  return {
    title: movie.title,
    description: movie.description || `Watch ${movie.title} streaming on FlickerPlay. ${movie.genre.name} movie starring ${movie.cast?.join(", ") || movie.director}.`,
    openGraph: {
      title: movie.title,
      description: movie.description || `Watch ${movie.title} on FlickerPlay`,
      images: [
        { url: movie.poster || movie.image, width: 800, height: 1200 },
      ],
      type: "video.movie",
    },
    twitter: {
      card: "summary_large_image",
      title: movie.title,
      description: movie.description || `Watch ${movie.title} on FlickerPlay`,
      images: [movie.poster || movie.image],
    },
  };
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  const user = session?.user;
  
  // Fetch movie by slug
  const movieData = await getMovieBySlug(slug);
  const movie = movieData.data;

  if (!movie) {
    notFound();
  }

  // Increment view count (fire and forget)
  incrementMovieViews(movie.id).catch(console.error);

  // Fetch related movies + watch progress in parallel
  const [relatedMoviesData, progressData] = await Promise.all([
    listMovies({ genreId: movie.genreId, limit: 6 }),
    user?.id ? getWatchProgress(user.id, movie.id, "movie") : Promise.resolve(null),
  ]);

  const relatedMovies = (relatedMoviesData.data || []).filter((m) => m.id !== movie.id);
  const initialProgress = progressData?.data?.progressPercent ?? 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Goes straight to player — no preview step */}
      <MoviePlayer movie={movie} userId={user?.id} initialProgress={initialProgress} />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <MovieDetails userId={user?.id || ""} movie={movie} />
            
            {/* Trailer Section */}
            {movie.trailerUrl && (
              <MovieTrailer movie={movie} />
            )}
          </div>

          {/* Right Column - Cast & Director */}
          <div className="space-y-6">
            {/* Director */}
            {movie.director && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Director</h3>
                <p className="text-white font-medium">{movie.director}</p>
              </div>
            )}

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Cast</h3>
                <div className="space-y-2">
                  {movie.cast.map((actor, index) => (
                    <p key={index} className="text-white">{actor}</p>
                  ))}
                </div>
              </div>
            )}

            {/* VJ Info */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Translated By</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {movie.vj.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="text-white font-medium">{movie.vj.name}</p>
                  {movie.vj.bio && (
                    <p className="text-sm text-gray-400">{movie.vj.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <div className="mt-16">
            <RelatedMovies movies={relatedMovies} />
          </div>
        )}
      </div>
    </div>
  );
}