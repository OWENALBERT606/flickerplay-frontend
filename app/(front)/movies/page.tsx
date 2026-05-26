import { Suspense } from "react";
import { listMovies } from "@/actions/movies";
import { listLabaMovies, normalizeLabaMovie } from "@/actions/labafilm";
import { getCachedListGenres, getCachedListVJs, getCachedListReleaseYears } from "@/lib/cache";

export const dynamic = "force-dynamic";
import { getSession } from "@/actions/auth";
import { MoviesSidebar } from "./components/movies-sidebar";
import { InfiniteMovieGrid } from "./components/infinite-movie-grid";
import { Film } from "lucide-react";
export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{
    genre?: string;
    vj?: string;
    year?: string;
    search?: string;
    page?: string;
    trending?: string;
    coming_soon?: string;
    dubbed?: string;
    sort?: string;
  }>;
}) {
  const session = await getSession();
  const userId  = session?.user?.id;
  const params  = await searchParams;
  const currentPage = parseInt(params.page || "1");

  /* ── Build API filter params ── */
  const apiParams: Parameters<typeof listMovies>[0] = {
    page:  currentPage,
    limit: 24,
    genreId:     params.genre       && params.genre       !== "all" ? params.genre       : undefined,
    vjId:        params.vj          && params.vj          !== "all" ? params.vj          : undefined,
    yearId:      params.year        && params.year        !== "all" ? params.year        : undefined,
    search:      params.search      || undefined,
    isTrending:  params.trending    === "1"   ? true  : undefined,
    isComingSoon: params.coming_soon === "1"  ? true  : undefined,
  };

  const shouldFetchLaba = !params.genre && !params.vj && !params.year && !params.trending && !params.coming_soon;

  /* ── Fetch in parallel — use allSettled so a failing call never blocks the page ── */
  const [moviesResult, labaResult, genresResult, vjsResult, yearsResult] = await Promise.allSettled([
    listMovies(apiParams),
    shouldFetchLaba ? listLabaMovies(currentPage) : Promise.resolve({ movies: [], pagination: null }),
    getCachedListGenres(),
    getCachedListVJs(),
    getCachedListReleaseYears(),
  ]);

  const moviesData = moviesResult.status === "fulfilled" ? moviesResult.value : { data: [], pagination: undefined };
  const labaData   = labaResult.status   === "fulfilled" ? labaResult.value   : { movies: [], pagination: null };
  const genresData = genresResult.status === "fulfilled" ? genresResult.value : { data: [] };
  const vjsData    = vjsResult.status    === "fulfilled" ? vjsResult.value    : { data: [] };
  const yearsData  = yearsResult.status  === "fulfilled" ? yearsResult.value  : { data: [] };

  let movies   = moviesData.data || [];
  const genres = genresData.data || [];
  const vjs    = vjsData.data    || [];
  const years  = yearsData.data  || [];
  const pagination = moviesData.pagination;

  // Append LabaFilm movies not already in DB results
  if (shouldFetchLaba && labaData.movies.length > 0) {
    const dbExternalIds = new Set(movies.map((m) => m.externalId).filter(Boolean));
    const labaExtras = labaData.movies
      .filter((m) => !dbExternalIds.has(m._id))
      .map(normalizeLabaMovie);
    movies = [...movies, ...labaExtras];
  }

  /* ── Client-side dubbed filter (VJ presence) ── */
  if (params.dubbed === "yes") {
    movies = movies.filter((m) => !!m.vjId && !!m.vj?.name);
  } else if (params.dubbed === "no") {
    movies = movies.filter((m) => !m.vjId || !m.vj?.name);
  }

  /* ── Client-side sort ── */
  if (params.sort === "rating") {
    movies = [...movies].sort((a, b) => b.rating - a.rating);
  }

  const dbTotalPages   = pagination?.totalPages ?? 1;
  const labaTotalPages = labaData.pagination?.total_pages ?? 1;
  const totalPages     = shouldFetchLaba ? Math.max(dbTotalPages, labaTotalPages) : dbTotalPages;

  // Combined total: DB-migrated movies + LabaFilm CDN movies not yet in DB
  const dbTotal   = pagination?.total ?? 0;
  const labaTotal = shouldFetchLaba ? (labaData.pagination?.total ?? 0) : 0;
  // LabaFilm total already includes movies we've migrated to DB (with externalId),
  // so subtract DB movies that came from LabaFilm to avoid double-counting.
  // As an approximation use the simpler of the two: prefer labaTotal when it's > dbTotal,
  // otherwise add them (covers manually-uploaded movies not from LabaFilm).
  const totalMoviesWithVideos = labaTotal > dbTotal
    ? labaTotal
    : dbTotal + labaTotal || movies.length;

  /* ── Active filter label for heading ── */
  const activeVJ    = vjs.find((v) => v.id === params.vj);
  const activeGenre = genres.find((g) => g.id === params.genre);

  const heading = activeVJ
    ? `${activeVJ.name} Movies`
    : activeGenre
    ? `${activeGenre.name} Movies`
    : params.trending    === "1" ? "🔥 Trending Movies"
    : params.coming_soon === "1" ? "⏳ Coming Soon"
    : params.dubbed      === "yes" ? "🎙 Translated (VJ) Movies"
    : params.dubbed      === "no"  ? "🌐 Original Movies"
    : params.sort        === "rating" ? "⭐ Top Rated Movies"
    : "All Movies";

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 px-4 md:px-8 lg:px-12 pb-12">
        <div className="flex flex-col gap-6">

          {/* ── Top filter bar ── */}
          <Suspense>
            <MoviesSidebar genres={genres} vjs={vjs} years={years} />
          </Suspense>

          {/* ── Main content ── */}
          <div className="min-w-0">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Film className="w-7 h-7 text-orange-500" />
                  {heading}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {totalMoviesWithVideos} movie{totalMoviesWithVideos !== 1 ? "s" : ""}
                  {activeVJ && (
                    <span className="ml-1">translated by <span className="text-orange-400 font-medium">{activeVJ.name}</span></span>
                  )}
                </p>
              </div>
            </div>

            {/* Infinite scroll grid */}
            <InfiniteMovieGrid
              initialMovies={movies}
              initialPage={currentPage}
              totalPages={totalPages}
              userId={userId}
              searchParams={params}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Remove old Pagination component — replaced by infinite scroll ── */
