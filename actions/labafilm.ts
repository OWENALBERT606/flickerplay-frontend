import type { Movie } from "@/actions/movies";

const LABA_API = "https://www.labafilm.com/api";
const LABA_HEADERS = {
  "x-api-key": "3c694c4b1337b149acb22bf4398705a70f5c92ec606da6ba744064123afbc04a",
  "Referer": "https://www.labafilm.com/",
  "Content-Type": "application/json",
};

export interface LabaMovieListItem {
  _id: string;
  title: string;
  vj: string;
  poster: string;
  release_date: string;
  rating?: number;
  year?: number;
}

export interface LabaMovie extends LabaMovieListItem {
  overview: string;
  video: string;
  genres: string[];
  director: string;
  country: string;
  company: string;
}

export interface LabaPagination {
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

/** Fetch one page of Laba Film movies directly from labafilm.com. Returns [] on failure. */
export async function listLabaMovies(
  page = 1
): Promise<{ movies: LabaMovieListItem[]; pagination: LabaPagination | null }> {
  try {
    const res = await fetch(`${LABA_API}/movies/all?page=${page}`, {
      headers: LABA_HEADERS,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { movies: [], pagination: null };
    const json = await res.json();
    const pageData = json.data ?? {};
    const movies: LabaMovieListItem[] = pageData.movies ?? [];
    const hasMore: boolean = pageData.hasMore ?? false;
    return {
      movies,
      pagination: {
        limit: movies.length,
        page,
        total: 0,
        // keep incrementing so infinite scroll continues while hasMore is true
        total_pages: hasMore ? page + 1 : page,
      },
    };
  } catch {
    return { movies: [], pagination: null };
  }
}

/** Convert a raw LabaMovieListItem to the shared Movie shape for grid rendering. */
export function normalizeLabaMovie(m: LabaMovieListItem): Movie {
  const year =
    m.year ??
    (m.release_date ? parseInt(m.release_date.substring(0, 4), 10) : 0);
  return {
    id: m._id,
    title: m.title,
    slug: `lb/${m._id}`,
    image: m.poster || "",
    poster: m.poster || "",
    trailerPoster: m.poster || "",
    rating: m.rating ?? 0,
    vjId: m.vj ? "laba-vj" : "",
    genreId: "",
    yearId: "",
    viewsCount: 0 as unknown as bigint,
    size: "",
    sizeBytes: null,
    length: "",
    lengthSeconds: null,
    description: "",
    director: "",
    cast: [],
    trailerUrl: "",
    videoUrl: "",
    subtitles: [],
    isComingSoon: false,
    isTrending: false,
    createdAt: "",
    updatedAt: "",
    vj: m.vj
      ? { id: "laba-vj", name: m.vj, avatarUrl: "" }
      : { id: "", name: "", avatarUrl: "" },
    genre: { id: "", name: "Movie", slug: "" },
    year: { id: "", value: year },
    source: "tx",
  };
}

/** Fetch a single Laba Film movie detail directly from labafilm.com. Returns null on failure. */
export async function getLabaMovie(id: string): Promise<LabaMovie | null> {
  try {
    const res = await fetch(`${LABA_API}/movies/${id}`, {
      headers: LABA_HEADERS,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}
