"use server";

import axios from "axios";
import { revalidatePath } from "next/cache";

const BASE_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

export interface Comment {
  id: string;
  content: string;
  userId: string;
  movieId?: string | null;
  seriesId?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

/**
 * Fetch comments for a specific item
 */
export async function getComments(type: "movie" | "series", id: string) {
  try {
    const res = await api.get(`/comments/${type}/${id}`);
    return { success: true, data: res.data.data as Comment[] };
  } catch (error: any) {
    console.error("Get comments error:", error?.response?.data || error.message);
    return { success: false, error: "Failed to fetch comments" };
  }
}

/**
 * Create a new comment
 */
export async function createComment(data: {
  content: string;
  userId: string;
  type: "movie" | "series";
  itemId: string;
}) {
  try {
    const res = await api.post("/comments", data);
    revalidatePath(data.type === "movie" ? `/movies/${data.itemId}` : `/series/${data.itemId}`);
    return { success: true, data: res.data.data as Comment };
  } catch (error: any) {
    console.error("Create comment error:", error?.response?.data || error.message);
    return { success: false, error: "Failed to post comment" };
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(id: string, userId: string, type: "movie" | "series", itemId: string) {
  try {
    await api.delete(`/comments/${id}`, { data: { userId } });
    revalidatePath(type === "movie" ? `/movies/${itemId}` : `/series/${itemId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Delete comment error:", error?.response?.data || error.message);
    return { success: false, error: "Failed to delete comment" };
  }
}
