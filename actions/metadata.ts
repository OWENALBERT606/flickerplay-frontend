"use server";

import axios from "axios";
import { cookies } from "next/headers";

const BASE_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

async function getAuthHeader() {
  const jar = await cookies();
  const token = jar.get("accessToken")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
    const headers = await getAuthHeader();
    const res = await api.get("/metadata/search/movie", {
      params: { title },
      headers,
    });
    return res.data?.data || [];
  } catch (e: any) {
    console.error("searchMovieMetadata error:", e?.message);
    return [];
  }
}

export async function searchSeriesMetadata(title: string): Promise<MetadataCandidate[]> {
  try {
    const headers = await getAuthHeader();
    const res = await api.get("/metadata/search/series", {
      params: { title },
      headers,
    });
    return res.data?.data || [];
  } catch (e: any) {
    console.error("searchSeriesMetadata error:", e?.message);
    return [];
  }
}

/* ── Enrich ── */
export async function enrichMovieMetadata(tmdbId: number): Promise<EnrichedMovie | null> {
  try {
    const headers = await getAuthHeader();
    const res = await api.get(`/metadata/enrich/movie/${tmdbId}`, { headers });
    return res.data?.data || null;
  } catch (e: any) {
    console.error("enrichMovieMetadata error:", e?.message);
    return null;
  }
}

export async function enrichSeriesMetadata(tmdbId: number): Promise<EnrichedSeries | null> {
  try {
    const headers = await getAuthHeader();
    const res = await api.get(`/metadata/enrich/series/${tmdbId}`, { headers });
    return res.data?.data || null;
  } catch (e: any) {
    console.error("enrichSeriesMetadata error:", e?.message);
    return null;
  }
}
