"use server";

import axios from "axios";
import { revalidatePath } from "next/cache";

/** Axios client to your backend API */
const BASE_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

/* --------------------------------- helpers --------------------------------- */

function msg(e: any, fallback = "Request failed") {
  return e?.response?.data?.error || e?.message || fallback;
}

/* ---------------------------------- types ---------------------------------- */

export interface ReleaseYear {
  id: string;
  value: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    movies: number;
  };
}

export interface ReleaseYearCreateInput {
  value: number;
}

export interface ReleaseYearUpdateInput {
  value?: number;
}

/* ------------------------------- server actions ---------------------------- */

/** GET /release-years */
export async function listReleaseYears(params?: { q?: string; page?: number; pageSize?: number }) {
  try {
    const res = await api.get("/release-years", { params });
    return { success: true, data: (res.data?.data ?? []) as ReleaseYear[] };
  } catch (e: any) {
    console.error("listReleaseYears error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to load release years") };
  }
}

/** GET /release-years/:id */
export async function getReleaseYear(id: string) {
  try {
    const res = await api.get(`/release-years/${id}`);
    return { success: true, data: res.data?.data as ReleaseYear };
  } catch (e: any) {
    console.error("getReleaseYear error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch release year") };
  }
}

/** GET /release-years/value/:value */
export async function getReleaseYearByValue(value: number) {
  try {
    const res = await api.get(`/release-years/value/${value}`);
    return { success: true, data: res.data?.data as ReleaseYear };
  } catch (e: any) {
    console.error("getReleaseYearByValue error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch release year") };
  }
}

/** POST /release-years */
export async function createReleaseYear(input: ReleaseYearCreateInput) {
  try {
    const payload: ReleaseYearCreateInput = {
      value: input.value,
    };
    
    console.log("Creating release year with payload:", payload);
    
    const res = await api.post("/release-years", payload);
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/release-years");
    revalidatePath("/dashboard/movies");
    
    return { success: true, data: res.data?.data as ReleaseYear };
  } catch (e: any) {
    console.error("createReleaseYear error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to create release year") };
  }
}

/** PUT /release-years/:id */
export async function updateReleaseYear(id: string, input: ReleaseYearUpdateInput) {
  try {
    const payload: ReleaseYearUpdateInput = {
      value: input.value,
    };
    
    console.log("Updating release year with payload:", payload);
    
    const res = await api.put(`/release-years/${id}`, payload);
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/release-years");
    revalidatePath(`/dashboard/release-years/${id}`);
    revalidatePath("/dashboard/movies");
    
    return { success: true, data: res.data?.data as ReleaseYear };
  } catch (e: any) {
    console.error("updateReleaseYear error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to update release year") };
  }
}

/** DELETE /release-years/:id */
export async function deleteReleaseYear(id: string) {
  try {
    console.log("Deleting release year:", id);
    
    const res = await api.delete(`/release-years/${id}`);
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/release-years");
    revalidatePath("/dashboard/movies");
    
    return { success: true, message: "Release year deleted successfully" };
  } catch (e: any) {
    console.error("deleteReleaseYear error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to delete release year") };
  }
}