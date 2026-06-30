"use server";

import axios from "axios";
import type { Movie } from "@/actions/movies";

const BASE_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

const api = axios.create({ baseURL: BASE_API_URL, timeout: 30000 });

export interface DiscoveryResult {
  success: boolean;
  data: Movie[];
  total: number;
  page: number;
  totalPages: number;
  error?: string;
}

function ok(res: any): DiscoveryResult {
  return {
    success: true,
    data: (res.data?.data ?? []) as Movie[],
    total: res.data?.total ?? 0,
    page: res.data?.page ?? 1,
    totalPages: res.data?.totalPages ?? 1,
  };
}
function fail(e: any): DiscoveryResult {
  return { success: false, data: [], total: 0, page: 1, totalPages: 1, error: e?.message ?? "Error" };
}

/* ── Generic section fetcher ─────────────────────────────────────────────── */
export async function getDiscoverySection(
  section: "new" | "trending" | "top-rated" | "recent" | "genre",
  opts: { page?: number; limit?: number; genre?: string; search?: string } = {}
): Promise<DiscoveryResult> {
  try {
    const res = await api.get("/movies/discover", { params: { section, ...opts } });
    return ok(res);
  } catch (e: any) {
    return fail(e);
  }
}

/* ── Personalized sections ───────────────────────────────────────────────── */
export async function getContinueWatchingSection(
  userId: string,
  opts: { page?: number; limit?: number } = {}
): Promise<DiscoveryResult> {
  try {
    const res = await api.get("/movies/discover/continue-watching", { params: { userId, ...opts } });
    return ok(res);
  } catch (e: any) {
    return fail(e);
  }
}

export async function getRecommendedSection(
  userId: string,
  opts: { page?: number; limit?: number } = {}
): Promise<DiscoveryResult> {
  try {
    const res = await api.get("/movies/discover/recommended", { params: { userId, ...opts } });
    return ok(res);
  } catch (e: any) {
    return fail(e);
  }
}
