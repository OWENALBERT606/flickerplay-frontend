"use server";

import axios from "axios";
import { revalidatePath } from "next/cache";

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

export interface VJ {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    movies: number;
  };
}

export interface VJCreateInput {
  name: string;
  bio?: string;
  avatarUrl?: string;
}

export interface VJUpdateInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

/* ------------------------------- server actions ---------------------------- */

/** GET /vjs */
export async function listVJs(params?: { q?: string; page?: number; pageSize?: number }) {
  try {
    const res = await api.get("/vjs", { params });
    return { success: true, data: (res.data?.data ?? []) as VJ[] };
  } catch (e: any) {
    console.error("listVJs error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to load VJs") };
  }
}

/** GET /vjs/:id */
export async function getVJ(id: string) {
  try {
    const res = await api.get(`/vjs/${id}`);
    return { success: true, data: res.data?.data as VJ };
  } catch (e: any) {
    console.error("getVJ error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch VJ") };
  }
}

/** GET /vjs/name/:name */
export async function getVJByName(name: string) {
  try {
    const res = await api.get(`/vjs/name/${encodeURIComponent(name)}`);
    return { success: true, data: res.data?.data as VJ };
  } catch (e: any) {
    console.error("getVJByName error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch VJ") };
  }
}

/** POST /vjs */
export async function createVJ(input: VJCreateInput) {
  try {
    const payload: VJCreateInput = {
      name: input.name.trim(),
      bio: input.bio?.trim() || undefined,
      avatarUrl: input.avatarUrl?.trim() || undefined,
    };
    
    console.log("Creating VJ with payload:", payload);
    
    const res = await api.post("/vjs", payload);
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/vjs");
    revalidatePath("/dashboard/movies");
    
    return { success: true, data: res.data?.data as VJ };
  } catch (e: any) {
    console.error("createVJ error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to create VJ") };
  }
}

/** PUT /vjs/:id */
export async function updateVJ(id: string, input: VJUpdateInput) {
  try {
    const payload: VJUpdateInput = {
      name: input.name?.trim(),
      bio: input.bio?.trim() || undefined,
      avatarUrl: input.avatarUrl?.trim() || undefined,
    };
    
    console.log("Updating VJ with payload:", payload);
    
    const res = await api.put(`/vjs/${id}`, payload);
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/vjs");
    revalidatePath(`/dashboard/vjs/${id}`);
    revalidatePath("/dashboard/movies");
    
    return { success: true, data: res.data?.data as VJ };
  } catch (e: any) {
    console.error("updateVJ error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to update VJ") };
  }
}

/** DELETE /vjs/:id */
export async function deleteVJ(id: string) {
  try {
    console.log("Deleting VJ:", id);
    
    const res = await api.delete(`/vjs/${id}`);
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/vjs");
    revalidatePath("/dashboard/movies");
    
    return { success: true, message: "VJ deleted successfully" };
  } catch (e: any) {
    console.error("deleteVJ error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to delete VJ") };
  }
}