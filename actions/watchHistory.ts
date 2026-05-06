


// "use server";

// import axios from "axios";
// import { revalidatePath } from "next/cache";

// const BASE_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

// const api = axios.create({
//   baseURL: BASE_API_URL,
//   timeout: 12000,
//   headers: { "Content-Type": "application/json" },
// });

// function msg(e: any, fallback = "Request failed") {
//   return e?.response?.data?.error || e?.message || fallback;
// }

// /* ---------------------------------- types ---------------------------------- */

// export interface WatchHistoryItem {
//   id: string;
//   userId: string;
//   movieId?: string;
//   seriesId?: string;
//   episodeId?: string;
//   currentTime: number;
//   duration: number;
//   progressPercent: number;
//   completed: boolean;
//   lastWatchedAt: string;
//   movie?: any;
//   episode?: any;
//   series?: any;
// }

// /* ------------------------------- server actions ---------------------------- */

// /** POST /watchhistory - Update watch progress */
// export async function updateWatchProgress(
//   userId: string,
//   itemId: string,
//   type: "movie" | "episode",
//   currentTime: number,
//   duration: number,
//   seriesId?: string
// ) {
//   try {
//     console.log("Updating watch progress:", { userId, itemId, type, currentTime, duration });

//     const res = await api.post("/watchhistory", {
//       userId,
//       movieId: type === "movie" ? itemId : undefined,
//       episodeId: type === "episode" ? itemId : undefined,
//       seriesId: seriesId,
//       currentTime,
//       duration,
//     });

//     revalidatePath("/");
//     revalidatePath("/watch-history");

//     return { success: true, data: res.data?.data };
//   } catch (e: any) {
//     console.error("updateWatchProgress error:", e?.response?.data || e?.message);
//     return { success: false, error: msg(e, "Failed to update watch progress") };
//   }
// }

// /** GET /watchhistory/:userId - Get user's watch history */
// export async function getWatchHistory(userId: string, type?: "movies" | "series", limit?: number) {
//   try {
//     const params: any = {};
//     if (type) params.type = type;
//     if (limit) params.limit = limit;

//     const res = await api.get(`/watchhistory/${userId}`, { params });
//     return { success: true, data: res.data?.data as WatchHistoryItem[] };
//   } catch (e: any) {
//     console.error("getWatchHistory error:", e?.response?.data || e?.message);
//     return { success: false, error: msg(e, "Failed to fetch watch history") };
//   }
// }

// /** GET /watchhistory/:userId/continue - Get continue watching items */
// export async function getContinueWatching(userId: string, limit?: number) {
//   try {
//     const params = limit ? { limit } : undefined;
//     const res = await api.get(`/watchhistory/${userId}/continue`, { params });
//     return { success: true, data: res.data?.data as WatchHistoryItem[] };
//   } catch (e: any) {
//     console.error("getContinueWatching error:", e?.response?.data || e?.message);
//     return { success: false, error: msg(e, "Failed to fetch continue watching") };
//   }
// }

// /** GET /watchhistory/progress - Get watch progress for specific item */
// export async function getWatchProgress(
//   userId: string,
//   itemId: string,
//   type: "movie" | "episode"
// ) {
//   try {
//     const params: any = { userId };
//     if (type === "movie") {
//       params.movieId = itemId;
//     } else {
//       params.episodeId = itemId;
//     }

//     const res = await api.get("/watchhistory/progress", { params });
//     return { success: true, data: res.data?.data as WatchHistoryItem | null };
//   } catch (e: any) {
//     console.error("getWatchProgress error:", e?.response?.data || e?.message);
//     return { success: false, error: msg(e, "Failed to fetch watch progress") };
//   }
// }

// /** DELETE /watchhistory/:id - Delete specific watch history item */
// export async function deleteWatchHistoryItem(id: string) {
//   try {
//     const res = await api.delete(`/watchhistory/${id}`);

//     revalidatePath("/");
//     revalidatePath("/watch-history");

//     return { success: true, message: res.data?.message };
//   } catch (e: any) {
//     console.error("deleteWatchHistoryItem error:", e?.response?.data || e?.message);
//     return { success: false, error: msg(e, "Failed to delete watch history") };
//   }
// }

// /** DELETE /watchhistory/:userId/clear - Clear all watch history */
// export async function clearWatchHistory(userId: string) {
//   try {
//     const res = await api.delete(`/watchhistory/${userId}/clear`);

//     revalidatePath("/");
//     revalidatePath("/watch-history");

//     return { success: true, message: res.data?.message };
//   } catch (e: any) {
//     console.error("clearWatchHistory error:", e?.response?.data || e?.message);
//     return { success: false, error: msg(e, "Failed to clear watch history") };
//   }
// }



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

export interface WatchHistoryItem {
  id: string;
  userId: string;
  movieId?: string;
  seriesId?: string;
  episodeId?: string;
  currentTime: number;
  duration: number;
  progressPercent: number;
  completed: boolean;
  lastWatchedAt: string;
  createdAt: string;
  updatedAt: string;
  movie?: {
    id: string;
    title: string;
    slug: string;
    poster: string;
    image: string;
    rating: number;
    year: { value: number };
    genre: { name: string };
    vj?: { name: string };
  };
  episode?: {
    id: string;
    episodeNumber: number;
    title: string;
    poster?: string;
    season?: {
      seasonNumber: number;
      series?: {
        id: string;
        title: string;
        slug: string;
        poster: string;
        rating: number;
        year: { value: number };
        genre: { name: string };
        vj?: { name: string };
      };
    };
  };
  series?: {
    id: string;
    title: string;
    slug: string;
    poster: string;
    rating: number;
    year: { value: number };
    genre: { name: string };
    vj?: { name: string };
  };
}

/* ------------------------------- server actions ---------------------------- */

/** POST /watchhistory - Update watch progress */
export async function updateWatchProgress(
  userId: string,
  itemId: string,
  type: "movie" | "episode",
  currentTime: number,
  duration: number,
  seriesId?: string
) {
  try {
    console.log("📹 Updating watch progress:", { userId, itemId, type, currentTime, duration });

    const payload: any = {
      userId,
      currentTime,
      duration,
    };

    if (type === "movie") {
      payload.movieId = itemId;
    } else {
      payload.episodeId = itemId;
      if (seriesId) {
        payload.seriesId = seriesId;
      }
    }

    const res = await api.post("/watchhistory", payload);

    revalidatePath("/");
    revalidatePath("/watch-history");
    revalidatePath("/my-list");

    console.log("✅ Watch progress updated successfully");

    return { success: true, data: res.data?.data };
  } catch (e: any) {
    console.error("❌ updateWatchProgress error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to update watch progress") };
  }
}

/** GET /watchhistory/:userId - Get user's watch history */
export async function getWatchHistory(userId: string, type?: "movies" | "series", limit?: number) {
  try {
    console.log("📜 Fetching watch history for user:", userId);

    const params: any = {};
    if (type) params.type = type;
    if (limit) params.limit = limit;

    const res = await api.get(`/watchhistory/${userId}`, { params });
    
    console.log("✅ Watch history fetched:", res.data?.data?.length || 0, "items");

    return { success: true, data: res.data?.data as WatchHistoryItem[] };
  } catch (e: any) {
    console.error("❌ getWatchHistory error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch watch history"), data: [] };
  }
}

/** GET /watchhistory/:userId/continue - Get continue watching items */
export async function getContinueWatching(userId: string, limit?: number) {
  try {
    console.log("▶️ Fetching continue watching for user:", userId);

    const params = limit ? { limit } : undefined;
    const res = await api.get(`/watchhistory/${userId}/continue`, { params });
    
    console.log("✅ Continue watching fetched:", res.data?.data?.length || 0, "items");

    return { success: true, data: res.data?.data as WatchHistoryItem[] };
  } catch (e: any) {
    console.error("❌ getContinueWatching error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch continue watching"), data: [] };
  }
}

/** GET /watchhistory/progress - Get watch progress for specific item */
export async function getWatchProgress(
  userId: string,
  itemId: string,
  type: "movie" | "episode"
) {
  try {
    console.log("🔍 Fetching watch progress:", { userId, itemId, type });

    const params: any = { userId };
    if (type === "movie") {
      params.movieId = itemId;
    } else {
      params.episodeId = itemId;
    }

    const res = await api.get("/watchhistory/progress", { params });
    
    if (res.data?.data) {
      console.log("✅ Watch progress found:", res.data.data.progressPercent, "%");
    } else {
      console.log("ℹ️ No watch progress found");
    }

    return { success: true, data: res.data?.data as WatchHistoryItem | null };
  } catch (e: any) {
    console.error("❌ getWatchProgress error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch watch progress"), data: null };
  }
}

/** DELETE /watchhistory/:id - Delete specific watch history item */
export async function deleteWatchHistoryItem(id: string) {
  try {
    console.log("🗑️ Deleting watch history item:", id);

    const res = await api.delete(`/watchhistory/${id}`);

    revalidatePath("/");
    revalidatePath("/watch-history");

    console.log("✅ Watch history item deleted");

    return { success: true, message: res.data?.message || "Deleted successfully" };
  } catch (e: any) {
    console.error("❌ deleteWatchHistoryItem error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to delete watch history") };
  }
}

/** DELETE /watchhistory/:userId/clear - Clear all watch history */
export async function clearWatchHistory(userId: string) {
  try {
    console.log("🗑️ Clearing all watch history for user:", userId);

    const res = await api.delete(`/watchhistory/${userId}/clear`);

    revalidatePath("/");
    revalidatePath("/watch-history");

    console.log("✅ Watch history cleared");

    return { success: true, message: res.data?.message || "History cleared" };
  } catch (e: any) {
    console.error("❌ clearWatchHistory error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to clear watch history") };
  }
}