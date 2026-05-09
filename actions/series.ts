"use server";

import axios from "axios";
import { revalidatePath, revalidateTag } from "next/cache";
import { deleteR2Files } from "@/lib/r2-delete";

/** Axios client to your backend API */
const BASE_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

/* --------------------------------- helpers --------------------------------- */

function msg(e: any, fallback = "Request failed") {
  return e?.response?.data?.error || e?.message || fallback;
}

/* ---------------------------------- types ---------------------------------- */

export interface Series {
  id: string;
  slug: string;
  title: string;
  poster: string;
  trailerPoster: string;
  rating: number;
  vjId: string;
  vj: {
    id: string;
    name: string;
    avatarUrl: string;
    bio?: string;
  };
  genreId: string;
  genre: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  yearId: string;
  year: {
    id: string;
    value: number;
  };
  viewsCount: string;
  totalSeasons: number;
  totalEpisodes: number;
  description: string;
  director?: string;
  cast: string[];
  trailerUrl?: string;
  isTrending: boolean;
  isComingSoon: boolean;
  createdAt: string;
  updatedAt: string;
  seasons?: Season[];
  _count?: {
    seasons: number;
  };
}

export interface Season {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title?: string;
  description?: string;
  poster?: string;
  trailerUrl?: string;
  totalEpisodes: number;
  releaseYear?: number;
  createdAt: string;
  updatedAt: string;
  episodes?: Episode[];
  _count?: {
    episodes: number;
  };
}

export interface Episode {
  id: string;
  seasonId: string;
  episodeNumber: number;
  title: string;
  description?: string;
  videoUrl: string;
  poster?: string;
  length?: string;
  lengthSeconds?: number;
  size?: string;
  viewsCount: string;
  releaseDate?: string;
  createdAt: string;
  updatedAt: string;
  season?: {
    id: string;
    seasonNumber: number;
    title?: string;
    seriesId: string;
    series: {
      id: string;
      title: string;
      slug: string;
    };
  };
}

export interface EpisodeInput {
  episodeNumber: number;
  title: string;
  description?: string;
  videoUrl?: string;
  poster?: string;
  length?: string;
  lengthSeconds?: number;
  releaseDate?: string;
}

export interface SeasonInput {
  seasonNumber: number;
  title?: string;
  description?: string;
  poster?: string;
  releaseYear?: number;
  episodes?: EpisodeInput[];
}

export interface SeriesCreateInput {
  title: string;
  poster: string;
  trailerPoster: string;
  rating: number;
  vjId: string;
  genreId: string;
  yearId: string;
  description: string;
  director?: string;
  cast?: string[];
  trailerUrl?: string;
  isComingSoon?: boolean;
  isTrending?: boolean;
  seasons?: SeasonInput[];
}

export interface SeriesUpdateInput {
  title?: string;
  poster?: string;
  trailerPoster?: string;
  rating?: number;
  vjId?: string;
  genreId?: string;
  yearId?: string;
  description?: string;
  director?: string;
  cast?: string[];
  trailerUrl?: string;
  isComingSoon?: boolean;
  isTrending?: boolean;
}

export interface SeriesListParams {
  page?: number;
  limit?: number;
  genreId?: string;
  vjId?: string;
  yearId?: string;
  isTrending?: boolean;
  isComingSoon?: boolean;
  search?: string;
}

/* ------------------------------- SERIES ACTIONS ---------------------------- */

/** GET /series - List all series */
export async function listSeries(params?: SeriesListParams) {
  try {
    const res = await api.get("/series", { params });
    return {
      success: true,
      data: (res.data?.data ?? []) as Series[],
      pagination: res.data?.pagination,
    };
  } catch (e: any) {
    console.error("listSeries error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to load series") };
  }
}

/** GET /series/:id - Get series by ID */
export async function getSeries(id: string) {
  try {
    const res = await api.get(`/series/${id}`);
    return { success: true, data: res.data?.data as Series };
  } catch (e: any) {
    console.error("getSeries error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch series") };
  }
}

/** GET /series/slug/:slug - Get series by slug */
export async function getSeriesBySlug(slug: string) {
  try {
    const res = await api.get(`/series/slug/${slug}`);
    return { success: true, data: res.data?.data as Series };
  } catch (e: any) {
    console.error("getSeriesBySlug error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch series") };
  }
}

/** GET /series/trending - Get trending series */
export async function getTrendingSeries(limit = 10) {
  try {
    const res = await api.get("/series/trending", { params: { limit } });
    return { success: true, data: (res.data?.data ?? []) as Series[] };
  } catch (e: any) {
    console.error("getTrendingSeries error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch trending series") };
  }
}

/** GET /series/coming-soon - Get coming soon series */
export async function getComingSoonSeries(limit = 10) {
  try {
    const res = await api.get("/series/coming-soon", { params: { limit } });
    return { success: true, data: (res.data?.data ?? []) as Series[] };
  } catch (e: any) {
    console.error("getComingSoonSeries error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch coming soon series") };
  }
}

/** POST /series - Create series */
export async function createSeries(input: SeriesCreateInput) {
  try {
    console.log("Creating series with payload:", input);
    
    const res = await api.post("/series", input);
    
    revalidatePath("/dashboard/series");
    revalidateTag("series");

    return { success: true, data: res.data?.data as Series };
  } catch (e: any) {
    console.error("createSeries error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to create series") };
  }
}

/** PUT /series/:id - Update series */
export async function updateSeries(id: string, input: SeriesUpdateInput) {
  try {
    console.log("Updating series with payload:", input);
    
    const res = await api.put(`/series/${id}`, input);
    
    revalidatePath("/dashboard/series");
    revalidatePath(`/dashboard/series/${id}`);
    revalidatePath("/series");
    revalidateTag("series");

    return { success: true, data: res.data?.data as Series };
  } catch (e: any) {
    console.error("updateSeries error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to update series") };
  }
}

/** DELETE /series/:id - Delete series + all associated R2 files */
export async function deleteSeries(id: string) {
  try {
    // Fetch series, seasons, and all episode files before deleting from DB
    const [seriesRes, seasonsRes] = await Promise.allSettled([
      api.get(`/series/${id}`),
      api.get(`/series/${id}/seasons`),
    ]);

    const series = seriesRes.status === "fulfilled" ? seriesRes.value.data?.data : null;
    const seasons: any[] = seasonsRes.status === "fulfilled" ? (seasonsRes.value.data?.data ?? []) : [];

    // Fetch all episodes for every season in parallel
    const episodeBatches = await Promise.allSettled(
      seasons.map((s: any) => api.get(`/seasons/${s.id}/episodes`))
    );
    const allEpisodes = episodeBatches.flatMap((r) =>
      r.status === "fulfilled" ? (r.value.data?.data ?? []) : []
    );

    // Delete from database (cascade removes seasons + episodes in DB)
    await api.delete(`/series/${id}`);

    // Delete R2 files — awaited so Vercel doesn't kill the request before completion
    await deleteR2Files([
      series?.poster,
      series?.trailerPoster,
      ...seasons.map((s: any) => s.poster),
      ...allEpisodes.flatMap((e: any) => [e.videoUrl, e.poster]),
    ]);

    revalidatePath("/dashboard/series");
    revalidatePath("/series");
    revalidateTag("series");

    return { success: true, message: "Series deleted successfully" };
  } catch (e: any) {
    console.error("deleteSeries error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to delete series") };
  }
}

/** POST /series/:id/view - Increment series view count */
export async function incrementSeriesViews(id: string) {
  try {
    const res = await api.post(`/series/${id}/view`);
    return { success: true, data: res.data?.data };
  } catch (e: any) {
    console.error("incrementSeriesViews error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to increment view count") };
  }
}

/* ------------------------------- SEASON ACTIONS ---------------------------- */

export interface SeasonCreateInput {
  seasonNumber: number;
  title?: string;
  description?: string;
  poster?: string;
  trailerUrl?: string;
  releaseYear?: number;
}

export interface SeasonUpdateInput {
  seasonNumber?: number;
  title?: string;
  description?: string;
  poster?: string;
  trailerUrl?: string;
  releaseYear?: number;
}

/** GET /series/:seriesId/seasons - Get all seasons for a series */
export async function getSeasonsBySeriesId(seriesId: string) {
  try {
    const res = await api.get(`/series/${seriesId}/seasons`);
    return { success: true, data: (res.data?.data ?? []) as Season[] };
  } catch (e: any) {
    console.error("getSeasonsBySeriesId error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch seasons") };
  }
}

/** GET /seasons/:id - Get season by ID */
export async function getSeason(id: string) {
  try {
    const res = await api.get(`/seasons/${id}`);
    return { success: true, data: res.data?.data as Season };
  } catch (e: any) {
    console.error("getSeason error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch season") };
  }
}

/** POST /series/:seriesId/seasons - Create season */
export async function createSeason(seriesId: string, input: SeasonCreateInput) {
  try {
    console.log("Creating season with payload:", input);
    
    const res = await api.post(`/series/${seriesId}/seasons`, input);
    
    revalidatePath("/dashboard/series");
    revalidatePath(`/dashboard/series/${seriesId}`);
    revalidateTag("series");

    return { success: true, data: res.data?.data as Season };
  } catch (e: any) {
    console.error("createSeason error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to create season") };
  }
}

/** PUT /seasons/:id - Update season */
export async function updateSeason(id: string, input: SeasonUpdateInput) {
  try {
    console.log("Updating season with payload:", input);
    
    const res = await api.put(`/seasons/${id}`, input);
    
    revalidatePath("/dashboard/series");
    revalidateTag("series");

    return { success: true, data: res.data?.data as Season };
  } catch (e: any) {
    console.error("updateSeason error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to update season") };
  }
}

/** DELETE /seasons/:id - Delete season + all associated R2 files */
export async function deleteSeason(id: string) {
  try {
    // Fetch season and its episodes before deleting from DB
    const [seasonRes, episodesRes] = await Promise.allSettled([
      api.get(`/seasons/${id}`),
      api.get(`/seasons/${id}/episodes`),
    ]);

    const season = seasonRes.status === "fulfilled" ? seasonRes.value.data?.data : null;
    const episodes: any[] = episodesRes.status === "fulfilled" ? (episodesRes.value.data?.data ?? []) : [];

    // Delete from database
    await api.delete(`/seasons/${id}`);

    // Delete R2 files — awaited so Vercel doesn't kill the request before completion
    await deleteR2Files([
      season?.poster,
      ...episodes.flatMap((e: any) => [e.videoUrl, e.poster]),
    ]);

    revalidatePath("/dashboard/series");
    revalidateTag("series");

    return { success: true, message: "Season deleted successfully" };
  } catch (e: any) {
    console.error("deleteSeason error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to delete season") };
  }
}

/* ------------------------------- EPISODE ACTIONS ---------------------------- */

export interface EpisodeCreateInput {
  episodeNumber: number;
  title: string;
  description?: string;
  videoUrl: string;
  poster?: string;
  length?: string;
  lengthSeconds?: number;
  size?: string;
  releaseDate?: string;
}

export interface EpisodeUpdateInput {
  episodeNumber?: number;
  title?: string;
  description?: string;
  videoUrl?: string;
  poster?: string;
  length?: string;
  lengthSeconds?: number;
  size?: string;
  releaseDate?: string;
}

/** GET /seasons/:seasonId/episodes - Get all episodes for a season */
export async function getEpisodesBySeasonId(seasonId: string) {
  try {
    const res = await api.get(`/seasons/${seasonId}/episodes`);
    return { success: true, data: (res.data?.data ?? []) as Episode[] };
  } catch (e: any) {
    console.error("getEpisodesBySeasonId error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch episodes") };
  }
}

/** GET /episodes/:id - Get episode by ID */
export async function getEpisode(id: string) {
  try {
    const res = await api.get(`/episodes/${id}`);
    return { success: true, data: res.data?.data as Episode };
  } catch (e: any) {
    console.error("getEpisode error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch episode") };
  }
}

/** GET /episodes/:id/next - Get next episode */
export async function getNextEpisode(id: string) {
  try {
    const res = await api.get(`/episodes/${id}/next`);
    return { success: true, data: res.data?.data as Episode };
  } catch (e: any) {
    console.error("getNextEpisode error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch next episode") };
  }
}

/** GET /episodes/:id/previous - Get previous episode */
export async function getPreviousEpisode(id: string) {
  try {
    const res = await api.get(`/episodes/${id}/previous`);
    return { success: true, data: res.data?.data as Episode };
  } catch (e: any) {
    console.error("getPreviousEpisode error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch previous episode") };
  }
}

/** POST /seasons/:seasonId/episodes - Create episode */
export async function createEpisode(seasonId: string, input: EpisodeCreateInput) {
  try {
    console.log("Creating episode with payload:", input);
    
    const res = await api.post(`/seasons/${seasonId}/episodes`, input);
    
    revalidatePath("/dashboard/series");
    revalidateTag("series");

    return { success: true, data: res.data?.data as Episode };
  } catch (e: any) {
    console.error("createEpisode error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to create episode") };
  }
}

/** PUT /episodes/:id - Update episode */
export async function updateEpisode(id: string, input: EpisodeUpdateInput) {
  try {
    console.log("Updating episode with payload:", input);
    
    const res = await api.put(`/episodes/${id}`, input);
    
    revalidatePath("/dashboard/series");
    revalidateTag("series");

    return { success: true, data: res.data?.data as Episode };
  } catch (e: any) {
    console.error("updateEpisode error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to update episode") };
  }
}

/** DELETE /episodes/:id - Delete episode + associated R2 files */
export async function deleteEpisode(id: string) {
  try {
    // Fetch episode first to get file URLs before deleting from DB
    const episodeRes = await api.get(`/episodes/${id}`).catch(() => null);
    const episode = episodeRes?.data?.data;

    // Delete from database
    await api.delete(`/episodes/${id}`);

    // Delete R2 files — awaited so Vercel doesn't kill the request before completion
    if (episode) {
      await deleteR2Files([episode.videoUrl, episode.poster]);
    }

    revalidatePath("/dashboard/series");
    revalidateTag("series");

    return { success: true, message: "Episode deleted successfully" };
  } catch (e: any) {
    console.error("deleteEpisode error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to delete episode") };
  }
}

/** POST /episodes/:id/view - Increment episode view count */
export async function incrementEpisodeViews(id: string) {
  try {
    const res = await api.post(`/episodes/${id}/view`);
    return { success: true, data: res.data?.data };
  } catch (e: any) {
    console.error("incrementEpisodeViews error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to increment view count") };
  }
}

/** POST /series/:id/seasons - Add seasons to existing series */
export async function addSeasonsToSeries(seriesId: string, seasons: SeasonInput[]) {
  try {
    console.log("Adding seasons to series:", seriesId, seasons);
    
    const res = await api.post(`/series/${seriesId}/seasons`, { seasons });
    
    revalidatePath("/dashboard/series");
    revalidatePath(`/dashboard/series/${seriesId}`);
    revalidatePath(`/series/${seriesId}`);
    revalidateTag("series");

    return { success: true, data: res.data?.data as Series };
  } catch (e: any) {
    console.error("addSeasonsToSeries error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to add seasons") };
  }
}