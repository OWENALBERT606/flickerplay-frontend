import { getSession } from "@/actions/auth";
import {
  getComingSoonMovies,
  getTrendingMovies,
  listMovies,
} from "@/actions/movies";
import {
  getComingSoonSeries,
  getTrendingSeries,
  listSeries,
} from "@/actions/series";
import { ComingSoon } from "@/components/front-end/coming-soon";
import { ContinueWatching } from "@/components/front-end/continue-watching";
import { HeroCarousel } from "@/components/front-end/hero-couresel";
import { MovieSection } from "@/components/front-end/movie-section";
import { SeriesSection } from "@/components/series-component";
import { HomeSidebar } from "@/components/front-end/home-sidebar";
import { Suspense } from "react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; dubbed?: string }>;
}) {
  const { type, dubbed } = await searchParams;
  const session = await getSession();
  const user = session?.user;
  const userId = user?.id;

  /* ------------------------------------------------------------------
   * dubbed=yes → has a VJ (translated)
   * dubbed=no  → no VJ (original)
   * ------------------------------------------------------------------ */
  if (dubbed === "yes" || dubbed === "no") {
    const [allMoviesData, allSeriesData, comingSoonMoviesData, comingSoonSeriesData] =
      await Promise.all([
        listMovies({ limit: 50 }),
        listSeries({ limit: 50 }),
        getComingSoonMovies(50),
        getComingSoonSeries(50),
      ]);

    const comingSoonMovieIds = new Set((comingSoonMoviesData.data || []).map((m) => m.id));
    const comingSoonSeriesIds = new Set((comingSoonSeriesData.data || []).map((s) => s.id));

    const allMovies = (allMoviesData.data || []).filter((m) => !comingSoonMovieIds.has(m.id));
    const allSeries = (allSeriesData.data || []).filter((s) => !comingSoonSeriesIds.has(s.id));

    const hasVJ = dubbed === "yes";

    const movies = allMovies.filter((m) =>
      hasVJ ? !!m.vjId && !!m.vj?.name : !m.vjId || !m.vj?.name
    );
    const series = allSeries.filter((s) =>
      hasVJ ? !!s.vjId && !!s.vj?.name : !s.vjId || !s.vj?.name
    );

    const sectionTitle = hasVJ
      ? "🎙 Translated (VJ Dubbed)"
      : "🌐 Original (No VJ)";

    return (
      <PageShell type={dubbed} userId={userId}>
        {movies.length > 0 && (
          <MovieSection userId={userId} title={`${sectionTitle} — Movies`} movies={movies} />
        )}
        {series.length > 0 && (
          <SeriesSection userId={userId} title={`${sectionTitle} — Series`} series={series} />
        )}
        {movies.length === 0 && series.length === 0 && (
          <p className="text-muted-foreground text-center py-24">No content found.</p>
        )}
      </PageShell>
    );
  }

  /* ------------------------------------------------------------------
   * Fetch only what the current filter needs
   * ------------------------------------------------------------------ */

  // Always needed for sidebar + hero on home
  const isHome = !type;

  // ── movies filter ──────────────────────────────────────────────────
  if (type === "movies") {
    const [allMoviesData, comingSoonMoviesData] = await Promise.all([
      listMovies({ limit: 50 }),
      getComingSoonMovies(50),
    ]);
    const allMovies = allMoviesData.data || [];
    const comingSoonIds = new Set((comingSoonMoviesData.data || []).map((m) => m.id));
    const movies = allMovies.filter((m) => !comingSoonIds.has(m.id));

    return (
      <PageShell type={type} userId={userId}>
        <MovieSection userId={userId} title="All Movies" movies={movies} viewAllHref="/movies" />
      </PageShell>
    );
  }

  // ── series filter ──────────────────────────────────────────────────
  if (type === "series") {
    const [allSeriesData, comingSoonSeriesData] = await Promise.all([
      listSeries({ limit: 50 }),
      getComingSoonSeries(50),
    ]);
    const allSeries = allSeriesData.data || [];
    const comingSoonIds = new Set((comingSoonSeriesData.data || []).map((s) => s.id));
    const series = allSeries.filter((s) => !comingSoonIds.has(s.id));

    return (
      <PageShell type={type} userId={userId}>
        <SeriesSection userId={userId} title="All TV Series" series={series} />
      </PageShell>
    );
  }

  // ── trending filter ────────────────────────────────────────────────
  if (type === "trending") {
    const [trendingMoviesData, trendingSeriesData] = await Promise.all([
      getTrendingMovies(24),
      getTrendingSeries(24),
    ]);
    const trendingMovies = trendingMoviesData.data || [];
    const trendingSeries = trendingSeriesData.data || [];

    return (
      <PageShell type={type} userId={userId}>
        {trendingMovies.length > 0 && (
          <MovieSection userId={userId} title="🔥 Trending Movies" movies={trendingMovies} />
        )}
        {trendingSeries.length > 0 && (
          <SeriesSection userId={userId} title="🔥 Trending TV Series" series={trendingSeries} />
        )}
      </PageShell>
    );
  }

  // ── coming-soon filter ─────────────────────────────────────────────
  if (type === "coming-soon") {
    const [comingSoonMoviesData, comingSoonSeriesData] = await Promise.all([
      getComingSoonMovies(24),
      getComingSoonSeries(24),
    ]);
    return (
      <PageShell type={type} userId={userId}>
        <ComingSoon
          movies={comingSoonMoviesData.data || []}
          series={comingSoonSeriesData.data || []}
        />
      </PageShell>
    );
  }

  // ── most-watched filter ────────────────────────────────────────────
  if (type === "most-watched") {
    const [allMoviesData, allSeriesData] = await Promise.all([
      listMovies({ limit: 24 }),
      listSeries({ limit: 24 }),
    ]);
    const mostWatchedMovies = (allMoviesData.data || [])
      .sort((a, b) => Number(b.viewsCount) - Number(a.viewsCount));
    const mostWatchedSeries = (allSeriesData.data || [])
      .sort((a, b) => Number(b.viewsCount) - Number(a.viewsCount));

    return (
      <PageShell type={type} userId={userId}>
        {mostWatchedMovies.length > 0 && (
          <MovieSection userId={userId} title="👁 Most Watched Movies" movies={mostWatchedMovies} />
        )}
        {mostWatchedSeries.length > 0 && (
          <SeriesSection userId={userId} title="👁 Most Watched Series" series={mostWatchedSeries} />
        )}
      </PageShell>
    );
  }

  // ── top-rated filter ───────────────────────────────────────────────
  if (type === "top-rated") {
    const [allMoviesData, allSeriesData] = await Promise.all([
      listMovies({ limit: 24 }),
      listSeries({ limit: 24 }),
    ]);
    const topRatedMovies = (allMoviesData.data || [])
      .sort((a, b) => b.rating - a.rating);
    const topRatedSeries = (allSeriesData.data || [])
      .sort((a, b) => b.rating - a.rating);

    return (
      <PageShell type={type} userId={userId}>
        {topRatedMovies.length > 0 && (
          <MovieSection userId={userId} title="⭐ Top Rated Movies" movies={topRatedMovies} />
        )}
        {topRatedSeries.length > 0 && (
          <SeriesSection userId={userId} title="⭐ Top Rated Series" series={topRatedSeries} />
        )}
      </PageShell>
    );
  }

  // ── new releases filter ────────────────────────────────────────────
  if (type === "new") {
    const [allMoviesData, allSeriesData] = await Promise.all([
      listMovies({ limit: 24 }),
      listSeries({ limit: 24 }),
    ]);
    const newMovies = (allMoviesData.data || [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const newSeries = (allSeriesData.data || [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
      <PageShell type={type} userId={userId}>
        {newMovies.length > 0 && (
          <MovieSection userId={userId} title="🆕 New Movie Releases" movies={newMovies} />
        )}
        {newSeries.length > 0 && (
          <SeriesSection userId={userId} title="🆕 New TV Series" series={newSeries} />
        )}
      </PageShell>
    );
  }

  /* ------------------------------------------------------------------
   * HOME — default view
   * ------------------------------------------------------------------ */
  const [
    trendingMoviesData,
    comingSoonMoviesData,
    allMoviesData,
    trendingSeriesData,
    comingSoonSeriesData,
    allSeriesData,
  ] = await Promise.all([
    getTrendingMovies(12),
    getComingSoonMovies(12),
    listMovies({ limit: 12 }),
    getTrendingSeries(12),
    getComingSoonSeries(12),
    listSeries({ limit: 12 }),
  ]);

  const trendingMovies = trendingMoviesData.data || [];
  const comingSoonMovies = comingSoonMoviesData.data || [];
  const allMovies = allMoviesData.data || [];
  const trendingSeries = trendingSeriesData.data || [];
  const comingSoonSeries = comingSoonSeriesData.data || [];
  const allSeries = allSeriesData.data || [];

  const comingSoonMovieIds = new Set(comingSoonMovies.map((m) => m.id));
  const comingSoonSeriesIds = new Set(comingSoonSeries.map((s) => s.id));
  const availableMovies = allMovies.filter((m) => !comingSoonMovieIds.has(m.id));
  const availableSeries = allSeries.filter((s) => !comingSoonSeriesIds.has(s.id));
  const availableTrendingMovies = trendingMovies.filter((m) => !comingSoonMovieIds.has(m.id));
  const availableTrendingSeries = trendingSeries.filter((s) => !comingSoonSeriesIds.has(s.id));

  const newMovies = [...availableMovies]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const newSeries = [...availableSeries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const heroItems = [...availableMovies, ...availableSeries];

  return (
    <div className="min-h-screen bg-background">
      <HeroCarousel userId={userId} items={heroItems} />

      <main className="px-4 md:px-8 lg:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          <Suspense>
            <HomeSidebar />
          </Suspense>

          <div className="flex-1 min-w-0 space-y-12 pb-12">
            <ContinueWatching userId={userId} />

            {availableTrendingMovies.length > 0 && (
              <MovieSection userId={userId} title="🔥 Trending Movies" movies={availableTrendingMovies} />
            )}
            {availableTrendingSeries.length > 0 && (
              <SeriesSection userId={userId} title="🔥 Trending TV Series" series={availableTrendingSeries} />
            )}
            {newMovies.length > 0 && (
              <MovieSection userId={userId} title="🆕 New Releases" movies={newMovies} />
            )}
            {newSeries.length > 0 && (
              <SeriesSection userId={userId} title="🆕 New TV Series" series={newSeries} />
            )}
            {(comingSoonMovies.length > 0 || comingSoonSeries.length > 0) && (
              <ComingSoon movies={comingSoonMovies} series={comingSoonSeries} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------
 * Shared shell for filtered views (sidebar + layout, no hero)
 * ------------------------------------------------------------------ */
function PageShell({
  children,
  type,
  userId,
}: {
  children: React.ReactNode;
  type: string;
  userId?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 md:px-8 lg:px-12 py-8 mt-16">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          <Suspense>
            <HomeSidebar />
          </Suspense>
          <div className="flex-1 min-w-0 space-y-12 pb-12">{children}</div>
        </div>
      </main>
    </div>
  );
}
