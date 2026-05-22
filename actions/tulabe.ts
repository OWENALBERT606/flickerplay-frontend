import type { Movie } from "@/actions/movies";

const SCRAPER_URL = process.env.SCRAPER_API_URL || "http://localhost:3003";

export interface TulabeMovie {
  id: string;
  title: string;
  thumbnail_url: string;
  poster_url: string;
  stream_url: string;
  qualities: { quality: string; stream_url: string; playlist_url: string }[];
  genre_names: string;
  release_year: number;
  view_count: number;
  duration_seconds: number;
  source: "tulabe";
}

export interface TulabePagination {
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export interface TulabeListResponse {
  success: boolean;
  source: string;
  pagination: TulabePagination;
  movies: TulabeMovie[];
}

/** Fetch a page of Tulabe movies from the scraper API. Returns [] on failure. */
export async function listTulabeMovies(page = 1): Promise<{ movies: TulabeMovie[]; pagination: TulabePagination | null }> {
  try {
    const res = await fetch(`${SCRAPER_URL}/movies?page=${page}&limit=20`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { movies: [], pagination: null };
    const data: TulabeListResponse = await res.json();
    return { movies: data.movies || [], pagination: data.pagination || null };
  } catch {
    return { movies: [], pagination: null };
  }
}

/** Convert a raw TulabeMovie to the shared Movie shape for grid rendering. */
export function normalizeTulabeMovie(m: TulabeMovie): Movie {
  const bestStream = m.qualities?.find(q => q.stream_url)?.stream_url || m.stream_url;
  return {
    id: m.id,
    title: m.title,
    slug: `tb/${m.id}`,
    image: m.thumbnail_url || "",
    poster: m.poster_url || m.thumbnail_url || "",
    trailerPoster: m.poster_url || m.thumbnail_url || "",
    rating: 0,
    vjId: "",
    genreId: "",
    yearId: "",
    viewsCount: (m.view_count || 0) as unknown as bigint,
    size: m.duration_seconds ? `${Math.round(m.duration_seconds / 60)} min` : "",
    sizeBytes: null,
    length: m.duration_seconds ? `${Math.round(m.duration_seconds / 60)} min` : "",
    lengthSeconds: m.duration_seconds || null,
    description: "",
    director: "",
    cast: [],
    trailerUrl: "",
    videoUrl: bestStream,
    subtitles: [],
    isComingSoon: false,
    isTrending: false,
    createdAt: "",
    updatedAt: "",
    vj: { id: "", name: "SC1", avatarUrl: "" },
    genre: { id: "", name: m.genre_names || "Movie", slug: "" },
    year: { id: "", value: m.release_year || 0 },
    source: "tx",
  };
}

/** Fetch a single Tulabe movie by ID. Returns null on failure. */
export async function getTulabeMovie(id: string): Promise<TulabeMovie | null> {
  try {
    const res = await fetch(`${SCRAPER_URL}/movies/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.movie || data || null;
  } catch {
    return null;
  }
}
