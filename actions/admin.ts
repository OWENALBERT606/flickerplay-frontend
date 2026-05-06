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

/* ---------------------------------- Get All Users ---------------------------------- */

export async function getAllUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
}) {
  try {
    const res = await api.get("/admin/users", { params });

    return {
      success: true,
      data: res.data?.data?.users,
      stats: res.data?.data?.stats,
      totalPages: res.data?.data?.totalPages,
    };
  } catch (e: any) {
    console.error("❌ Error fetching users:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to fetch users"),
      data: [],
      stats: {},
      totalPages: 1,
    };
  }
}

/* ---------------------------------- Update User Status ---------------------------------- */

export async function updateUserStatus(userId: string, status: string) {
  try {
    const res = await api.patch(`/admin/users/${userId}/status`, { status });

    revalidatePath("/dashboard/users");

    return {
      success: true,
      data: res.data?.data,
    };
  } catch (e: any) {
    console.error("❌ Error updating user status:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to update user status"),
    };
  }
}

/* ---------------------------------- Delete User ---------------------------------- */

export async function deleteUser(userId: string) {
  try {
    await api.delete(`/admin/users/${userId}`);

    revalidatePath("/dashboard/users");

    return {
      success: true,
    };
  } catch (e: any) {
    console.error("❌ Error deleting user:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to delete user"),
    };
  }
}

/* ---------------------------------- Get All Payments ---------------------------------- */

export async function getAllPayments(params: {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
}) {
  try {
    const res = await api.get("/admin/payments", { params });

    return {
      success: true,
      data: res.data?.data?.payments,
      stats: res.data?.data?.stats,
      totalPages: res.data?.data?.totalPages,
    };
  } catch (e: any) {
    console.error("❌ Error fetching payments:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to fetch payments"),
      data: [],
      stats: {},
      totalPages: 1,
    };
  }
}

/* ---------------------------------- Get Admin Settings ---------------------------------- */

export async function getAdminSettings() {
  try {
    const res = await api.get("/admin/settings");

    return {
      success: true,
      data: res.data?.data,
    };
  } catch (e: any) {
    console.error("❌ Error fetching settings:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to fetch settings"),
      data: null,
    };
  }
}

/* ---------------------------------- Update General Settings ---------------------------------- */

export async function updateGeneralSettings(settings: any) {
  try {
    const res = await api.put("/admin/settings/general", settings);

    revalidatePath("/dashboard/settings");

    return {
      success: true,
      data: res.data?.data,
    };
  } catch (e: any) {
    console.error("❌ Error updating settings:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to update settings"),
    };
  }
}

/* ---------------------------------- Update Payment Settings ---------------------------------- */

export async function updatePaymentSettings(settings: any) {
  try {
    const res = await api.put("/admin/settings/payment", settings);

    revalidatePath("/dashboard/settings");

    return {
      success: true,
      data: res.data?.data,
    };
  } catch (e: any) {
    console.error("❌ Error updating payment settings:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to update payment settings"),
    };
  }
}