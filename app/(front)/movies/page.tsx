import { Suspense } from "react";
import { listMovies } from "@/actions/movies";
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

  /* ── Fetch VJs first (cached) so we can detect the "Translated" special case ── */
  const vjsData = await getCachedListVJs();
  const vjs = vjsData.data || [];

  /* ── "Translated" VJ pill = show everything that is NOT "Non Translated" ── */
  const selectedVJ = vjs.find((v) => v.id === params.vj);
  const isTranslatedFilter = selectedVJ?.name?.toLowerCase() === "translated";

  /* ── Build API filter params ── */
  const apiSortBy =
    params.sort === "rating" ? "rating" :
    params.sort === "views"  ? "views"  :
    params.sort === "newest" ? "newest" :
    "year"; // default: release year desc

  const apiParams: Parameters<typeof listMovies>[0] = {
    page:  currentPage,
    limit: 24,
    genreId:      params.genre       && params.genre       !== "all" ? params.genre       : undefined,
    vjId:         params.vj          && params.vj          !== "all" && !isTranslatedFilter
                    ? params.vj : undefined,
    yearId:       params.year        && params.year        !== "all" ? params.year        : undefined,
    search:       params.search      || undefined,
    isTrending:   params.trending    === "1"  ? true  : undefined,
    isComingSoon: params.coming_soon === "1"  ? true  : undefined,
    sortBy:       apiSortBy,
  };

  /* ── Fetch remaining data in parallel ── */
  const [moviesResult, genresResult, yearsResult] = await Promise.allSettled([
    listMovies(apiParams),
    getCachedListGenres(),
    getCachedListReleaseYears(),
  ]);

  const moviesData = moviesResult.status === "fulfilled" ? moviesResult.value : { data: [], pagination: undefined };
  const genresData = genresResult.status === "fulfilled" ? genresResult.value : { data: [] };
  const yearsData  = yearsResult.status  === "fulfilled" ? yearsResult.value  : { data: [] };

  let movies   = moviesData.data || [];
  const genres = genresData.data || [];
  const years  = yearsData.data  || [];
  const pagination = moviesData.pagination;

  /* ── "Translated" VJ: exclude "Non Translated" movies ── */
  if (isTranslatedFilter) {
    movies = movies.filter((m) => m.vj?.name?.toLowerCase() !== "non translated");
  }

  /* ── "VJ Dubbed" quick pill: has any VJ, excluding "Non Translated" ── */
  if (params.dubbed === "yes") {
    movies = movies.filter((m) => !!m.vjId && !!m.vj?.name && m.vj.name.toLowerCase() !== "non translated");
  } else if (params.dubbed === "no") {
    movies = movies.filter((m) => !m.vjId || !m.vj?.name);
  }


  const totalPages = pagination?.totalPages ?? 1;
  const total      = pagination?.total ?? movies.length;

  /* ── Active filter label for heading ── */
  const activeVJ    = vjs.find((v) => v.id === params.vj);
  const activeGenre = genres.find((g) => g.id === params.genre);

  const heading = activeVJ
    ? `${activeVJ.name} Movies`
    : activeGenre
    ? `${activeGenre.name} Movies`
    : params.trending    === "1"      ? "🔥 Trending Movies"
    : params.coming_soon === "1"      ? "⏳ Coming Soon"
    : params.dubbed      === "yes"    ? "🎙 Translated (VJ) Movies"
    : params.dubbed      === "no"     ? "🌐 Original Movies"
    : params.sort        === "rating" ? "⭐ Top Rated Movies"
    : params.sort        === "views"  ? "👁 Most Viewed Movies"
    : params.sort        === "newest" ? "🆕 New Releases"
    : "All Movies";

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 md:px-8 lg:px-12 pb-12">
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
                  {total} movie{total !== 1 ? "s" : ""}
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
