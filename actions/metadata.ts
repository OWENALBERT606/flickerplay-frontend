"use server";

import axios from "axios";

const BASE_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

/* ── Types ── */
export interface MetadataCandidate {
  tmdbId: number;
  title: string;
  year: string | null;
  poster: string | null;
  overview: string;
}

export interface EnrichedMovie {
  title: string;
  description: string;
  poster: string | null;
  image: string | null;
  trailerPoster: string | null;
  director: string | null;
  cast: string[];
  rating: number;
  length: string;
  lengthSeconds: number;
  trailerUrl: string | null;
  isTrending: boolean;
  isComingSoon: boolean;
  genreId: string | null;
  yearId: string | null;
  slug: string;
  videoUrl: null;
  vjId: null;
  size: null;
  sizeBytes: null;
  downloadUrl: null;
  subtitles: null;
  _meta: {
    tmdbId: number;
    imdbId: string | null;
    posterOptions: string[];
    trailerSource: "imdb" | "tmdb" | "youtube" | "manual";
    ratingSource: "imdb" | "tmdb";
  };
}

export interface EnrichedSeries extends Omit<EnrichedMovie, "length" | "lengthSeconds"> {
  totalSeasons: number;
  totalEpisodes: number;
}

/* ── Search ── */
export async function searchMovieMetadata(title: string): Promise<MetadataCandidate[]> {
  try {
    const res = await api.get("/metadata/search/movie", { params: { title } });
    return res.data?.data || [];
  } catch (e: any) {
    console.error("searchMovieMetadata error:", e?.message);
    return [];
  }
}

export async function searchSeriesMetadata(title: string): Promise<MetadataCandidate[]> {
  try {
    const res = await api.get("/metadata/search/series", { params: { title } });
    return res.data?.data || [];
  } catch (e: any) {
    console.error("searchSeriesMetadata error:", e?.message);
    return [];
  }
}

/* ── Enrich ── */
export async function enrichMovieMetadata(tmdbId: number): Promise<EnrichedMovie | null> {
  try {
    const res = await api.get(`/metadata/enrich/movie/${tmdbId}`);
    return res.data?.data || null;
  } catch (e: any) {
    console.error("enrichMovieMetadata error:", e?.message);
    return null;
  }
}

export async function enrichSeriesMetadata(tmdbId: number): Promise<EnrichedSeries | null> {
  try {
    const res = await api.get(`/metadata/enrich/series/${tmdbId}`);
    return res.data?.data || null;
  } catch (e: any) {
    console.error("enrichSeriesMetadata error:", e?.message);
    return null;
  }
}

/* ── Season metadata ── */
export interface TmdbEpisodeMeta {
  episodeNumber: number;
  title: string;
  description: string | null;
  poster: string | null;
  length: string | null;
  lengthSeconds: number | null;
  releaseDate: string | null;
}

export interface TmdbSeasonMeta {
  seasonNumber: number;
  title: string | null;
  description: string | null;
  poster: string | null;
  releaseYear: number | null;
  posterOptions: string[];
  episodes: TmdbEpisodeMeta[];
}

export async function enrichSeasonMetadata(
  tmdbSeriesId: number,
  seasonNumber: number
): Promise<TmdbSeasonMeta | null> {
  try {
    const res = await api.get(`/metadata/season/${tmdbSeriesId}/${seasonNumber}`);
    return res.data?.data || null;
  } catch (e: any) {
    console.error("enrichSeasonMetadata error:", e?.message);
    return null;
  }
}

export interface TmdbEpisodeFullMeta extends TmdbEpisodeMeta {
  stillOptions: string[];
  director: string | null;
  writers: string[];
}

export async function enrichEpisodeMetadata(
  tmdbSeriesId: number,
  seasonNumber: number,
  episodeNumber: number
): Promise<TmdbEpisodeFullMeta | null> {
  try {
    const res = await api.get(`/metadata/episode/${tmdbSeriesId}/${seasonNumber}/${episodeNumber}`);
    return res.data?.data || null;
  } catch (e: any) {
    console.error("enrichEpisodeMetadata error:", e?.message);
    return null;
  }
}

/* ── Upcoming from TMDB (external coming soon) ── */
export interface TmdbUpcomingItem {
  tmdbId:      number;
  title:       string;
  overview:    string;
  poster:      string | null;
  backdrop:    string | null;
  releaseDate: string | null;
  releaseYear: string | null;
  rating:      number;
  source:      "tmdb";
}

export async function getUpcomingMoviesFromTmdb(limit = 20): Promise<TmdbUpcomingItem[]> {
  try {
    const res = await api.get("/metadata/upcoming/movies", { params: { limit } });
    return res.data?.data || [];
  } catch (e: any) {
    console.error("getUpcomingMoviesFromTmdb error:", e?.message);
    return [];
  }
}

export async function getUpcomingSeriesFromTmdb(limit = 20): Promise<TmdbUpcomingItem[]> {
  try {
    const res = await api.get("/metadata/upcoming/series", { params: { limit } });
    return res.data?.data || [];
  } catch (e: any) {
    console.error("getUpcomingSeriesFromTmdb error:", e?.message);
    return [];
  }
}
