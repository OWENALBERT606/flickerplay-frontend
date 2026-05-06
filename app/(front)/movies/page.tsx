import { Suspense } from "react";
import { listMovies } from "@/actions/movies";
import { listGenres } from "@/actions/genres";
import { listVJs } from "@/actions/vjs";
import { listReleaseYears } from "@/actions/releaseYear";

export const dynamic = "force-dynamic";
import { getSession } from "@/actions/auth";
import { MovieGrid } from "./components/movies-grid";
import { MoviesSidebar } from "./components/movies-sidebar";
import { FilterDrawer } from "@/components/front-end/filter-drawer";
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

  /* ── Fetch in parallel — use allSettled so a failing sidebar call never blocks the page ── */
  const [moviesResult, genresResult, vjsResult, yearsResult] = await Promise.allSettled([
    listMovies(apiParams),
    listGenres(),
    listVJs(),
    listReleaseYears(),
  ]);

  const moviesData = moviesResult.status === "fulfilled" ? moviesResult.value : { data: [], pagination: undefined };
  const genresData = genresResult.status === "fulfilled" ? genresResult.value : { data: [] };
  const vjsData    = vjsResult.status    === "fulfilled" ? vjsResult.value    : { data: [] };
  const yearsData  = yearsResult.status  === "fulfilled" ? yearsResult.value  : { data: [] };

  let movies     = moviesData.data     || [];
  const genres   = genresData.data     || [];
  const vjs      = vjsData.data        || [];
  const years    = yearsData.data      || [];
  const pagination = moviesData.pagination;

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

  /* ── Active filter label for heading ── */
  const activeVJ    = vjs.find((v) => v.id === params.vj);
  const activeGenre = genres.find((g) => g.id === params.genre);

  const heading = activeVJ
    ? `VJ ${activeVJ.name} Movies`
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
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">

          {/* ── Sidebar ── */}
          <Suspense>
            <MoviesSidebar genres={genres} vjs={vjs} years={years} />
          </Suspense>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Mobile/tablet filter drawer */}
            <Suspense>
              <FilterDrawer
                basePath="/movies"
                placeholder="Search movies…"
                genres={genres}
                vjs={vjs}
                years={years}
                allLabel="All Movies"
              />
            </Suspense>

            {/* Header */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Film className="w-7 h-7 text-orange-500" />
                  {heading}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {pagination?.total ?? movies.length} movie{(pagination?.total ?? movies.length) !== 1 ? "s" : ""}
                  {activeVJ && (
                    <span className="ml-1">translated by <span className="text-orange-400 font-medium">VJ {activeVJ.name}</span></span>
                  )}
                </p>
              </div>
            </div>

            {/* Grid */}
            <MovieGrid userId={userId} movies={movies} />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                params={params}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Simple pagination ─────────────────────────────────────────── */
function Pagination({
  currentPage,
  totalPages,
  params,
}: {
  currentPage: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  const buildHref = (page: number) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v && k !== "page") p.set(k, v); });
    p.set("page", String(page));
    return `/movies?${p.toString()}`;
  };

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (currentPage <= 4) return i + 1;
    if (currentPage >= totalPages - 3) return totalPages - 6 + i;
    return currentPage - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {currentPage > 1 && (
        <a href={buildHref(currentPage - 1)}
          className="px-3 py-1.5 rounded-lg bg-secondary text-sm hover:bg-secondary/80 transition-colors">
          ← Prev
        </a>
      )}
      {pages.map((p) => (
        <a key={p} href={buildHref(p)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            p === currentPage
              ? "bg-orange-500 text-white font-semibold"
              : "bg-secondary hover:bg-secondary/80"
          }`}>
          {p}
        </a>
      ))}
      {currentPage < totalPages && (
        <a href={buildHref(currentPage + 1)}
          className="px-3 py-1.5 rounded-lg bg-secondary text-sm hover:bg-secondary/80 transition-colors">
          Next →
        </a>
      )}
    </div>
  );
}
