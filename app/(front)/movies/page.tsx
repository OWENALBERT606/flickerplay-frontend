import { Suspense } from "react";
import { getSession } from "@/actions/auth";
import { listMovies } from "@/actions/movies";
import { getCachedListGenres, getCachedListVJs, getCachedListReleaseYears } from "@/lib/cache";
import {
  getDiscoverySection,
  getContinueWatchingSection,
  getRecommendedSection,
  type DiscoveryResult,
} from "@/actions/movies-discovery";
import { MovieSection } from "./components/movie-section";
import { SectionSkeleton } from "./components/section-skeleton";
import { MoviesSidebar } from "./components/movies-sidebar";
import { InfiniteMovieGrid } from "./components/infinite-movie-grid";
import { Film } from "lucide-react";
import type { Movie } from "@/actions/movies";

export const dynamic = "force-dynamic";

async function ContinueWatchingSection({ userId }: { userId: string }) {
  const result = await getContinueWatchingSection(userId, { limit: 18 });
  if (!result.success || result.data.length === 0) return null;
  return (
    <MovieSection
      title="Continue Watching"
      icon="▶️"
      movies={result.data}
      viewAllHref="/movies/continue-watching"
      cols={9}
    />
  );
}

async function RecommendedSection({ userId }: { userId: string }) {
  const result = await getRecommendedSection(userId, { limit: 18 });
  if (!result.success || result.data.length === 0) return null;
  return (
    <MovieSection
      title="Recommended For You"
      icon="✨"
      movies={result.data}
      viewAllHref="/movies/recommended"
      cols={9}
    />
  );
}

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

  const hasFilters =
    params.genre || params.vj || params.year || params.search ||
    params.trending || params.coming_soon || params.dubbed || params.sort;

  /* ── Filter data (always needed for sidebar) ── */
  const [vjsData, genresData, yearsData] = await Promise.all([
    getCachedListVJs(),
    getCachedListGenres(),
    getCachedListReleaseYears(),
  ]);

  const vjs    = vjsData.data   || [];
  const genres = genresData.data || [];
  const years  = yearsData.data  || [];

  /* ── Filtered view ── */
  let filteredMovies: Movie[] = [];
  let totalPages = 1;
  let total = 0;
  let heading = "All Movies";

  if (hasFilters) {
    const selectedVJ = vjs.find((v) => v.id === params.vj);
    const isTranslatedFilter = selectedVJ?.name?.toLowerCase() === "translated";

    const apiSortBy =
      params.sort === "rating" ? "rating" :
      params.sort === "views"  ? "views"  :
      params.sort === "newest" ? "newest" : "year";

    const result = await listMovies({
      page:  currentPage,
      limit: 27,
      genreId:      params.genre       && params.genre       !== "all" ? params.genre       : undefined,
      vjId:         params.vj          && params.vj          !== "all" && !isTranslatedFilter ? params.vj : undefined,
      yearId:       params.year        && params.year        !== "all" ? params.year        : undefined,
      search:       params.search      || undefined,
      isTrending:   params.trending    === "1" ? true : undefined,
      isComingSoon: params.coming_soon === "1" ? true : undefined,
      sortBy:       apiSortBy,
    });

    let movies = result.data || [];
    if (isTranslatedFilter) movies = movies.filter((m) => m.vj?.name?.toLowerCase() !== "non translated");
    if (params.dubbed === "yes") movies = movies.filter((m) => !!m.vjId && !!m.vj?.name && m.vj.name.toLowerCase() !== "non translated");
    else if (params.dubbed === "no") movies = movies.filter((m) => !m.vjId || !m.vj?.name);

    filteredMovies = movies;
    totalPages = result.pagination?.totalPages ?? 1;
    total = result.pagination?.total ?? movies.length;

    const activeVJ    = vjs.find((v) => v.id === params.vj);
    const activeGenre = genres.find((g) => g.id === params.genre);
    heading =
      activeVJ        ? `${activeVJ.name} Movies`
      : activeGenre   ? `${activeGenre.name} Movies`
      : params.trending    === "1"      ? "🔥 Trending Movies"
      : params.coming_soon === "1"      ? "⏳ Coming Soon"
      : params.dubbed      === "yes"    ? "🎙 Translated (VJ) Movies"
      : params.dubbed      === "no"     ? "🌐 Original Movies"
      : params.sort        === "rating" ? "⭐ Top Rated Movies"
      : params.sort        === "views"  ? "👁 Most Viewed Movies"
      : params.sort        === "newest" ? "🆕 New Releases"
      : params.search ? `Results for "${params.search}"`
      : "All Movies";
  }

  /* ── Discovery sections (only when no filters) ── */
  const emptyDisc: DiscoveryResult = { data: [], total: 0, page: 1, totalPages: 1, success: false };
  let newlyData   = emptyDisc;
  let trendData   = emptyDisc;
  let topData     = emptyDisc;
  let recentData  = emptyDisc;
  let actionData  = emptyDisc;
  let comedyData  = emptyDisc;
  let dramaData   = emptyDisc;

  if (!hasFilters) {
    const settled = await Promise.allSettled([
      getDiscoverySection("new",       { limit: 18 }),
      getDiscoverySection("trending",  { limit: 18 }),
      getDiscoverySection("top-rated", { limit: 18 }),
      getDiscoverySection("recent",    { limit: 18 }),
      getDiscoverySection("genre",     { limit: 18, genre: "Action" }),
      getDiscoverySection("genre",     { limit: 18, genre: "Comedy" }),
      getDiscoverySection("genre",     { limit: 18, genre: "Drama" }),
    ]);

    const pick = (r: PromiseSettledResult<DiscoveryResult>): DiscoveryResult =>
      r.status === "fulfilled" ? r.value : emptyDisc;

    [newlyData, trendData, topData, recentData, actionData, comedyData, dramaData] =
      settled.map(pick) as [DiscoveryResult, DiscoveryResult, DiscoveryResult, DiscoveryResult, DiscoveryResult, DiscoveryResult, DiscoveryResult];
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 md:px-8 lg:px-12 pb-16 pt-6">

        {/* ── Filter bar ── */}
        <Suspense>
          <MoviesSidebar genres={genres} vjs={vjs} years={years} />
        </Suspense>

        <div className="mt-8">
          {hasFilters ? (
            /* ── Filtered results ── */
            <>
              <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Film className="w-6 h-6 text-orange-500" />
                    {heading}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {total} movie{total !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <InfiniteMovieGrid
                initialMovies={filteredMovies}
                initialPage={currentPage}
                totalPages={totalPages}
                userId={userId}
                searchParams={params}
              />
            </>
          ) : (
            /* ── Netflix-style discovery ── */
            <div className="space-y-10">
              {userId && (
                <>
                  <Suspense fallback={<SectionSkeleton count={9} />}>
                    <ContinueWatchingSection userId={userId} />
                  </Suspense>
                  <Suspense fallback={<SectionSkeleton count={9} />}>
                    <RecommendedSection userId={userId} />
                  </Suspense>
                </>
              )}

              <MovieSection title="Newly Added"       icon="🆕" movies={newlyData.data}  viewAllHref="/movies/new"             cols={9} />
              <MovieSection title="Trending Now"      icon="🔥" movies={trendData.data}  viewAllHref="/movies/trending"        cols={9} />
              <MovieSection title="Top Rated"         icon="⭐" movies={topData.data}    viewAllHref="/movies/top-rated"       cols={9} />
              <MovieSection title="Recently Released" icon="🎬" movies={recentData.data} viewAllHref="/movies/recent-releases" cols={9} />
              <MovieSection title="Action"            icon="💥" movies={actionData.data} viewAllHref="/movies/action"          cols={9} />
              <MovieSection title="Comedy"            icon="😂" movies={comedyData.data} viewAllHref="/movies/comedy"          cols={9} />
              <MovieSection title="Drama"             icon="🎭" movies={dramaData.data}  viewAllHref="/movies/drama"           cols={9} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
