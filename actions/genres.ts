// // app/actions/genres.ts
// "use server";

// import axios from "axios";
// import { cookies } from "next/headers";
// import { revalidatePath } from "next/cache";

// /** Axios client to your backend API */
// const BASE_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";
// const api = axios.create({
//   baseURL: BASE_API_URL,
//   timeout: 12000,
//   headers: { "Content-Type": "application/json" },
// });

// /* --------------------------------- helpers --------------------------------- */

// function msg(e: any, fallback = "Request failed") {
//   return e?.response?.data?.error || e?.message || fallback;
// }

// async function authHeaderFromCookies() {
//   const jar = await cookies();
//   const token = jar.get("accessToken")?.value;
//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// /* ---------------------------------- types ---------------------------------- */

// export interface Genre {
//   id: string;
//   name: string;
//   slug: string;
//   description: string | null;
//   createdAt: string;
//   updatedAt: string;
//   _count?: {
//     movies: number;
//   };
// }

// export interface GenreCreateInput {
//   name: string;
//   description?: string;
// }

// export interface GenreUpdateInput {
//   name?: string;
//   description?: string;
// }

// /* ------------------------------- server actions ---------------------------- */

// /** GET /genres (optional query/pagination if your API supports it) */
// export async function listGenres(params?: { q?: string; page?: number; pageSize?: number }) {
//   try {
//     const res = await api.get("/genres", { params });
//     return { success: true, data: (res.data?.data ?? []) as Genre[] };
//   } catch (e: any) {
//     return { success: false, error: msg(e, "Failed to load genres") };
//   }
// }

// /** GET /genres/:id */
// export async function getGenre(id: string) {
//   try {
//     const res = await api.get(`/genres/${id}`);
//     return { success: true, data: res.data?.data as Genre };
//   } catch (e: any) {
//     return { success: false, error: msg(e, "Failed to fetch genre") };
//   }
// }

// /** GET /genres/slug/:slug */
// export async function getGenreBySlug(slug: string) {
//   try {
//     const res = await api.get(`/genres/slug/${slug}`);
//     return { success: true, data: res.data?.data as Genre };
//   } catch (e: any) {
//     return { success: false, error: msg(e, "Failed to fetch genre") };
//   }
// }

// /** POST /genres */
// export async function createGenre(input: GenreCreateInput) {
//   try {
//     const headers = await authHeaderFromCookies();
//     const payload: GenreCreateInput = {
//       name: input.name.trim(),
//       description: input.description?.trim() || undefined,
//     };
//     const res = await api.post("/genres", payload, { headers });
    
//     // Revalidate relevant paths
//     revalidatePath("/dashboard/genres");
//     revalidatePath("/dashboard/movies");
    
//     return { success: true, data: res.data?.data as Genre };
//   } catch (e: any) {
//     return { success: false, error: msg(e, "Failed to create genre") };
//   }
// }

// /** PUT /genres/:id */
// export async function updateGenre(id: string, input: GenreUpdateInput) {
//   try {
//     const headers = await authHeaderFromCookies();
//     const payload: GenreUpdateInput = {
//       name: input.name?.trim(),
//       description: input.description?.trim() || undefined,
//     };
//     const res = await api.put(`/genres/${id}`, payload, { headers });
    
//     // Revalidate relevant paths
//     revalidatePath("/dashboard/genres");
//     revalidatePath(`/dashboard/genres/${id}`);
//     revalidatePath("/dashboard/movies");
    
//     return { success: true, data: res.data?.data as Genre };
//   } catch (e: any) {
//     return { success: false, error: msg(e, "Failed to update genre") };
//   }
// }

// /** DELETE /genres/:id */
// export async function deleteGenre(id: string) {
//   try {
//     const headers = await authHeaderFromCookies();
//     const res = await api.delete(`/genres/${id}`, { headers });
    
//     // Revalidate relevant paths
//     revalidatePath("/dashboard/genres");
//     revalidatePath("/dashboard/movies");
    
//     return { success: true, message: "Genre deleted successfully" };
//   } catch (e: any) {
//     return { success: false, error: msg(e, "Failed to delete genre") };
//   }
// }




// app/actions/genres.ts
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

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    movies: number;
  };
}

export interface GenreCreateInput {
  name: string;
  description?: string;
}

export interface GenreUpdateInput {
  name?: string;
  description?: string;
}

/* ------------------------------- server actions ---------------------------- */

/** GET /genres */
export async function listGenres(params?: { q?: string; page?: number; pageSize?: number }) {
  try {
    const res = await api.get("/genres", { params });
    return { success: true, data: (res.data?.data ?? []) as Genre[] };
  } catch (e: any) {
    console.error("listGenres error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to load genres") };
  }
}

/** GET /genres/:id */
export async function getGenre(id: string) {
  try {
    const res = await api.get(`/genres/${id}`);
    return { success: true, data: res.data?.data as Genre };
  } catch (e: any) {
    console.error("getGenre error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch genre") };
  }
}

/** GET /genres/slug/:slug */
export async function getGenreBySlug(slug: string) {
  try {
    const res = await api.get(`/genres/slug/${slug}`);
    return { success: true, data: res.data?.data as Genre };
  } catch (e: any) {
    console.error("getGenreBySlug error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to fetch genre") };
  }
}

/** POST /genres - No authentication required */
export async function createGenre(input: GenreCreateInput) {
  try {
    const payload: GenreCreateInput = {
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
    };
    
    console.log("Creating genre with payload:", payload);
    
    const res = await api.post("/genres", payload);
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/genres");
    revalidatePath("/dashboard/movies");
    
    return { success: true, data: res.data?.data as Genre };
  } catch (e: any) {
    console.error("createGenre error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to create genre") };
  }
}

/** PUT /genres/:id - No authentication required */
export async function updateGenre(id: string, input: GenreUpdateInput) {
  try {
    const payload: GenreUpdateInput = {
      name: input.name?.trim(),
      description: input.description?.trim() || undefined,
    };
    
    console.log("Updating genre with payload:", payload);
    
    const res = await api.put(`/genres/${id}`, payload);
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/genres");
    revalidatePath(`/dashboard/genres/${id}`);
    revalidatePath("/dashboard/movies");
    
    return { success: true, data: res.data?.data as Genre };
  } catch (e: any) {
    console.error("updateGenre error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to update genre") };
  }
}

/** DELETE /genres/:id - No authentication required */
export async function deleteGenre(id: string) {
  try {
    console.log("Deleting genre:", id);
    
    const res = await api.delete(`/genres/${id}`);
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/genres");
    revalidatePath("/dashboard/movies");
    
    return { success: true, message: "Genre deleted successfully" };
  } catch (e: any) {
    console.error("deleteGenre error:", e?.response?.data || e?.message);
    return { success: false, error: msg(e, "Failed to delete genre") };
  }
}