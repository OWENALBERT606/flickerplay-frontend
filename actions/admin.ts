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

/* ---------------------------------- Toggle User Exemption ---------------------------------- */

export async function toggleUserExemption(userId: string, isExempt: boolean) {
  try {
    const res = await api.patch(`/admin/users/${userId}/exempt`, { isExempt });

    revalidatePath("/dashboard/users");

    return {
      success: true,
      data: res.data?.data,
    };
  } catch (e: any) {
    console.error("❌ Error updating user exemption status:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to update user exemption status"),
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

/* ---------------------------------- Get All Subscriptions ---------------------------------- */

export async function getAllSubscriptions(params: {
  page?: number;
  limit?: number;
  status?: string;
  plan?: string;
}) {
  try {
    const res = await api.get("/admin/subscriptions", { params });

    const raw = res.data?.data ?? {};
    const subscriptions: any[] = raw.subscriptions ?? [];
    const stats = raw.stats ?? {};
    const totalPages: number = raw.totalPages ?? 1;

    /* Build monthly revenue from subscription payments if backend doesn't */
    const revenueByMonth = buildSubscriptionRevenue(subscriptions);

    /* Status breakdown counts */
    const statusBreakdown = buildStatusBreakdown(subscriptions);

    return {
      success: true,
      data: subscriptions,
      stats: {
        totalRevenue:        stats.totalRevenue        ?? 0,
        monthlyRevenue:      stats.monthlyRevenue      ?? 0,
        activeCount:         stats.activeCount         ?? subscriptions.filter((s) => s.status === "ACTIVE").length,
        expiredCount:        stats.expiredCount        ?? subscriptions.filter((s) => s.status === "EXPIRED").length,
        cancelledCount:      stats.cancelledCount      ?? subscriptions.filter((s) => s.status === "CANCELLED").length,
        pendingCount:        stats.pendingCount        ?? subscriptions.filter((s) => s.status === "PENDING").length,
        revenueGrowth:       stats.revenueGrowth       ?? 0,
        activeGrowth:        stats.activeGrowth        ?? 0,
      },
      revenueByMonth,
      statusBreakdown,
      totalPages,
    };
  } catch (e: any) {
    console.error("❌ Error fetching subscriptions:", e?.response?.data || e?.message);
    return {
      success: false,
      error: msg(e, "Failed to fetch subscriptions"),
      data: [],
      stats: {
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeCount: 0,
        expiredCount: 0,
        cancelledCount: 0,
        pendingCount: 0,
        revenueGrowth: 0,
        activeGrowth: 0,
      },
      revenueByMonth: [],
      statusBreakdown: [],
      totalPages: 1,
    };
  }
}

/* ── Helpers ── */

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildSubscriptionRevenue(subscriptions: any[]) {
  const now = new Date();
  const map = new Map<string, number>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    map.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }

  for (const s of subscriptions) {
    if (s.status !== "ACTIVE" && s.status !== "EXPIRED") continue;
    const d = new Date(s.startDate ?? s.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + (s.amount ?? 0));
  }

  return Array.from(map.entries()).map(([key, revenue]) => {
    const [year, month] = key.split("-").map(Number);
    return { month: `${MONTHS[month]} ${year}`, revenue };
  });
}

function buildStatusBreakdown(subscriptions: any[]) {
  const counts: Record<string, number> = {
    ACTIVE: 0,
    EXPIRED: 0,
    CANCELLED: 0,
    PENDING: 0,
  };

  for (const s of subscriptions) {
    if (counts[s.status] !== undefined) counts[s.status]++;
  }

  return [
    { name: "Active",    value: counts.ACTIVE,    color: "#22c55e" },
    { name: "Expired",   value: counts.EXPIRED,   color: "#f97316" },
    { name: "Cancelled", value: counts.CANCELLED, color: "#ef4444" },
    { name: "Pending",   value: counts.PENDING,   color: "#eab308" },
  ].filter((d) => d.value > 0);
}