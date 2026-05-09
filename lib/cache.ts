import { unstable_cache } from "next/cache";
import { listMovies, getTrendingMovies, getComingSoonMovies, getMovieBySlug } from "@/actions/movies";
import { listSeries, getTrendingSeries, getComingSoonSeries, getSeriesBySlug } from "@/actions/series";
import { listGenres } from "@/actions/genres";
import { listVJs } from "@/actions/vjs";
import { listReleaseYears } from "@/actions/releaseYear";

// ── Movies ──────────────────────────────────────────────────────────────────

export const getCachedListMovies = unstable_cache(
  (params?: Parameters<typeof listMovies>[0]) => listMovies(params),
  ["list-movies"],
  { revalidate: 120, tags: ["movies"] }
);

export const getCachedTrendingMovies = unstable_cache(
  (limit = 10) => getTrendingMovies(limit),
  ["trending-movies"],
  { revalidate: 300, tags: ["movies"] }
);

export const getCachedComingSoonMovies = unstable_cache(
  (limit = 10) => getComingSoonMovies(limit),
  ["coming-soon-movies"],
  { revalidate: 300, tags: ["movies"] }
);

export const getCachedMovieBySlug = unstable_cache(
  (slug: string) => getMovieBySlug(slug),
  ["movie-by-slug"],
  { revalidate: 3600, tags: ["movies"] }
);

// ── Series ───────────────────────────────────────────────────────────────────

export const getCachedListSeries = unstable_cache(
  (params?: Parameters<typeof listSeries>[0]) => listSeries(params),
  ["list-series"],
  { revalidate: 120, tags: ["series"] }
);

export const getCachedTrendingSeries = unstable_cache(
  (limit = 10) => getTrendingSeries(limit),
  ["trending-series"],
  { revalidate: 300, tags: ["series"] }
);

export const getCachedComingSoonSeries = unstable_cache(
  (limit = 10) => getComingSoonSeries(limit),
  ["coming-soon-series"],
  { revalidate: 300, tags: ["series"] }
);

export const getCachedSeriesBySlug = unstable_cache(
  (slug: string) => getSeriesBySlug(slug),
  ["series-by-slug"],
  { revalidate: 3600, tags: ["series"] }
);

// ── Shared filters ───────────────────────────────────────────────────────────

export const getCachedListGenres = unstable_cache(
  () => listGenres(),
  ["list-genres"],
  { revalidate: 3600, tags: ["genres"] }
);

export const getCachedListVJs = unstable_cache(
  () => listVJs(),
  ["list-vjs"],
  { revalidate: 3600, tags: ["vjs"] }
);

export const getCachedListReleaseYears = unstable_cache(
  () => listReleaseYears(),
  ["list-release-years"],
  { revalidate: 3600, tags: ["years"] }
);
