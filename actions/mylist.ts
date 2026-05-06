"use server";

import axios from "axios";
import { revalidatePath } from "next/cache";

const BASE_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

function msg(e: any, fallback = "Request failed") {
  return e?.response?.data?.error || e?.message || fallback;
}

/* ---------------------------------- types ---------------------------------- */

export interface MyListMovie {
  id: string;
  addedAt: string;
  movie: {
    id: string;
    title: string;
    slug: string;
    poster: string;
    rating: number;
    year: {
      id: string;
      value: number;
    };
    genre: {
      id: string;
      name: string;
      slug: string;
    };
    vj: {
      id: string;
      name: string;
      avatarUrl: string;
    };
  };
}

export interface MyListSeries {
  id: string;
  addedAt: string;
  series: {
    id: string;
    title: string;
    slug: string;
    poster: string;
    rating: number;
    totalSeasons: number;
    totalEpisodes: number;
    year: {
      id: string;
      value: number;
    };
    genre: {
      id: string;
      name: string;
      slug: string;
    };
    vj: {
      id: string;
      name: string;
      avatarUrl: string;
    };
  };
}

export interface MyListData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  movies: MyListMovie[];
  series: MyListSeries[];
}

export interface MyListStats {
  totalMovies: number;
  totalSeries: number;
  total: number;
}

/* ------------------------------- server actions ---------------------------- */

/** POST /mylist - Add to my list */
export async function addToMyList(
  userId: string,
  itemId: string,
  type: "movie" | "series"
) {
  try {
    console.log(`Adding ${type} to list:`, { userId, itemId });

    const res = await api.post("/mylist", {
      userId,
      movieId: type === "movie" ? itemId : null,
      seriesId: type === "series" ? itemId : null,
    });

    revalidatePath("/my-list");
    revalidatePath("/movies");
    revalidatePath("/series");

    return { 
      success: true, 
      data: res.data?.data,
      message: res.data?.message 
    };
  } catch (e: any) {
    console.error("addToMyList error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to add to list") };
  }
}

/** DELETE /mylist - Remove from my list */
export async function removeFromMyList(
  userId: string,
  itemId: string,
  type: "movie" | "series"
) {
  try {
    console.log(`Removing ${type} from list:`, { userId, itemId });

    const res = await api.delete("/mylist", {
      data: {
        userId,
        movieId: type === "movie" ? itemId : null,
        seriesId: type === "series" ? itemId : null,
      },
    });

    revalidatePath("/my-list");
    revalidatePath("/movies");
    revalidatePath("/series");

    return { 
      success: true, 
      message: res.data?.message || "Removed from your list" 
    };
  } catch (e: any) {
    console.error("removeFromMyList error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to remove from list") };
  }
}

/** GET /mylist/:userId - Get user's list */
export async function getMyList(userId: string, type?: "movies" | "series") {
  try {
    const params = type ? { type } : undefined;
    const res = await api.get(`/mylist/${userId}`, { params });
    return { success: true, data: res.data?.data as MyListData };
  } catch (e: any) {
    console.error("getMyList error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch list") };
  }
}

/** GET /mylist/check - Check if item is in list */
export async function checkInMyList(
  userId: string,
  itemId: string,
  type: "movie" | "series"
) {
  try {
    const res = await api.get("/mylist/check", {
      params: {
        userId,
        ...(type === "movie" ? { movieId: itemId } : { seriesId: itemId }),
      },
    });
    return { 
      success: true, 
      inList: res.data?.data?.inList || false 
    };
  } catch (e: any) {
    console.error("checkInMyList error:", e?.response?.data || e?.message);
    return { success: false, inList: false };
  }
}

/** GET /mylist/:userId/stats - Get list statistics */
export async function getMyListStats(userId: string) {
  try {
    const res = await api.get(`/mylist/${userId}/stats`);
    return { success: true, data: res.data?.data as MyListStats };
  } catch (e: any) {
    console.error("getMyListStats error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch stats") };
  }
}