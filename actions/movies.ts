"use server";

import axios from "axios";
import { revalidatePath } from "next/cache";
import { deleteR2Files } from "@/lib/r2-delete";

const BASE_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

function msg(e: any, fallback = "Request failed") {
  return e?.response?.data?.error || e?.message || fallback;
}

/* ---------------------------------- types ---------------------------------- */

export interface Movie {
  id: string;
  title: string;
  slug: string;
  image: string;
  poster: string;
  trailerPoster: string;
  rating: number;
  vjId: string;
  genreId: string;
  yearId: string;
  viewsCount: bigint;
  size: string;
  sizeBytes: bigint | null;
  length: string;
  lengthSeconds: number | null;
  description: string;
  director: string;
  cast: string[];
  trailerUrl: string;
  videoUrl: string;
  subtitles?: { label: string; src: string; lang: string }[];
  isComingSoon: boolean;
  isTrending: boolean;
  createdAt: string;
  updatedAt: string;
  vj: {
    id: string;
    name: string;
    avatarUrl: string;
    bio?: string;
  };
  genre: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  year: {
    id: string;
    value: number;
  };
}

export interface MovieCreateInput {
  title: string;
  image: string;
  poster: string;
  trailerPoster: string;
  rating: number;
  vjId: string;
  genreId: string;
  yearId: string;
  size: string;
  sizeBytes?: number;
  length: string;
  lengthSeconds?: number;
  description: string;
  director: string;
  cast: string[];
  trailerUrl: string;
  videoUrl: string;
  isComingSoon?: boolean;
  isTrending?: boolean;
}

export interface MovieUpdateInput extends Partial<MovieCreateInput> {}

export interface MovieListParams {
  page?: number;
  limit?: number;
  genreId?: string;
  vjId?: string;
  yearId?: string;
  isTrending?: boolean;
  isComingSoon?: boolean;
  search?: string;
}

/* ------------------------------- server actions ---------------------------- */

/** GET /movies */
export async function listMovies(params?: MovieListParams) {
  try {
    const res = await api.get("/movies", { params });
    return {
      success: true,
      data: (res.data?.data ?? []) as Movie[],
      pagination: res.data?.pagination,
    };
  } catch (e: any) {
    console.error("listMovies error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to load movies") };
  }
}

/** GET /movies/:id */
export async function getMovie(id: string) {
  try {
    const res = await api.get(`/movies/${id}`);
    return { success: true, data: res.data?.data as Movie };
  } catch (e: any) {
    console.error("getMovie error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch movie") };
  }
}

/** GET /movies/slug/:slug */
export async function getMovieBySlug(slug: string) {
  try {
    const res = await api.get(`/movies/slug/${slug}`);
    return { success: true, data: res.data?.data as Movie };
  } catch (e: any) {
    console.error("getMovieBySlug error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch movie") };
  }
}

/** GET /movies/trending */
export async function getTrendingMovies(limit?: number) {
  try {
    const res = await api.get("/movies/trending", {
      params: { limit: limit || 10 },
    });
    return { success: true, data: (res.data?.data ?? []) as Movie[] };
  } catch (e: any) {
    console.error("getTrendingMovies error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch trending movies") };
  }
}

/** GET /movies/coming-soon */
export async function getComingSoonMovies(limit?: number) {
  try {
    const res = await api.get("/movies/coming-soon", {
      params: { limit: limit || 10 },
    });
    return { success: true, data: (res.data?.data ?? []) as Movie[] };
  } catch (e: any) {
    console.error("getComingSoonMovies error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch coming soon movies") };
  }
}

/** POST /movies */
export async function createMovie(input: MovieCreateInput) {
  try {
    console.log("Creating movie with payload:", input);

    const res = await api.post("/movies", input);

    revalidatePath("/dashboard/movies");
    revalidatePath("/movies");

    return { success: true, data: res.data?.data as Movie };
  } catch (e: any) {
    console.error("createMovie error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to create movie") };
  }
}

/** PUT /movies/:id */
export async function updateMovie(id: string, input: MovieUpdateInput) {
  try {
    console.log("Updating movie with payload:", input);

    const res = await api.put(`/movies/${id}`, input);

    revalidatePath("/dashboard/movies");
    revalidatePath(`/dashboard/movies/${id}`);
    revalidatePath(`/movies/${id}`);
    revalidatePath("/movies");

    return { success: true, data: res.data?.data as Movie };
  } catch (e: any) {
    console.error("updateMovie error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to update movie") };
  }
}

/** DELETE /movies/:id — also deletes associated R2 files */
export async function deleteMovie(id: string) {
  try {
    // Fetch movie first to get file URLs before deleting from DB
    const movieRes = await api.get(`/movies/${id}`);
    const movie = movieRes.data?.data;

    // Delete from database
    await api.delete(`/movies/${id}`);

    // Delete associated R2 files (fire and forget — don't block on this)
    if (movie) {
      deleteR2Files([
        movie.videoUrl,
        movie.image,
        movie.poster,
        movie.trailerPoster,
      ]).catch(console.error);
    }

    revalidatePath("/dashboard/movies");
    revalidatePath("/movies");

    return { success: true, message: "Movie deleted successfully" };
  } catch (e: any) {
    console.error("deleteMovie error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to delete movie") };
  }
}

/** POST /movies/:id/view */
export async function incrementMovieViews(id: string) {
  try {
    const res = await api.post(`/movies/${id}/view`);
    return { success: true, data: res.data?.data };
  } catch (e: any) {
    console.error("incrementMovieViews error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to increment views") };
  }
}