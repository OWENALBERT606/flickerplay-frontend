"use server";

import axios from "axios";

const BASE_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

/* safe fetch — never throws, returns null on failure */
async function safe<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

export async function getDashboardStats() {
  try {
    /* ── Try the dedicated stats endpoint first ── */
    const statsRes = await safe(api.get("/dashboard/stats"));
    if (statsRes?.data?.data && Object.keys(statsRes.data.data).length > 0) {
      return { success: true, data: statsRes.data.data };
    }

    /* ── Fallback: aggregate from individual endpoints ── */
    const [moviesRes, seriesRes, usersRes, paymentsRes] = await Promise.allSettled([
      api.get("/movies", { params: { limit: 100 } }),
      api.get("/series", { params: { limit: 100 } }),
      api.get("/admin/users", { params: { limit: 10 } }),
      api.get("/admin/payments", { params: { limit: 10 } }),
    ]);

    const movies   = moviesRes.status   === "fulfilled" ? moviesRes.value.data?.data   ?? [] : [];
    const series   = seriesRes.status   === "fulfilled" ? seriesRes.value.data?.data   ?? [] : [];
    const usersData   = usersRes.status   === "fulfilled" ? usersRes.value.data?.data   : null;
    const paymentsData = paymentsRes.status === "fulfilled" ? paymentsRes.value.data?.data : null;

    /* ── Users ── */
    const allUsers     = usersData?.users   ?? [];
    const userStats    = usersData?.stats   ?? {};
    const recentUsers  = allUsers.slice(0, 5).map((u: any) => ({
      id:          u.id,
      name:        `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
      email:       u.email,
      imageUrl:    u.imageUrl ?? null,
      currentPlan: u.currentPlan ?? null,
      createdAt:   u.createdAt,
    }));

    /* ── Payments ── */
    const allPayments       = paymentsData?.payments ?? [];
    const paymentStats      = paymentsData?.stats    ?? {};
    const recentTransactions = allPayments.slice(0, 5).map((p: any) => ({
      id:        p.id,
      user:      { name: p.user?.name ?? p.user?.email ?? "Unknown", email: p.user?.email ?? "" },
      amount:    p.amount ?? 0,
      status:    p.status ?? "PENDING",
      plan:      p.plan?.name ?? p.planName ?? "—",
      createdAt: p.createdAt,
    }));

    /* ── Movies stats ── */
    const totalMovies  = moviesRes.status === "fulfilled"
      ? (moviesRes.value.data?.pagination?.total ?? movies.length)
      : 0;

    /* ── Series stats ── */
    const totalSeries  = seriesRes.status === "fulfilled"
      ? (seriesRes.value.data?.pagination?.total ?? series.length)
      : 0;

    /* ── Views (sum viewsCount across fetched movies + series) ── */
    const totalViews = [
      ...movies.map((m: any) => Number(m.viewsCount ?? 0)),
      ...series.map((s: any) => Number(s.viewsCount ?? 0)),
    ].reduce((a: number, b: number) => a + b, 0);

    /* ── Top content ── */
    const topMovies = [...movies]
      .sort((a: any, b: any) => Number(b.viewsCount ?? 0) - Number(a.viewsCount ?? 0))
      .slice(0, 5)
      .map((m: any) => ({
        id:         m.id,
        title:      m.title,
        poster:     m.poster || m.image || "",
        viewsCount: Number(m.viewsCount ?? 0),
        rating:     m.rating ?? 0,
      }));

    const topSeries = [...series]
      .sort((a: any, b: any) => Number(b.viewsCount ?? 0) - Number(a.viewsCount ?? 0))
      .slice(0, 5)
      .map((s: any) => ({
        id:         s.id,
        title:      s.title,
        poster:     s.poster || "",
        viewsCount: Number(s.viewsCount ?? 0),
        rating:     s.rating ?? 0,
      }));

    /* ── Revenue chart — last 6 months placeholder from payment data ── */
    const revenueData = buildMonthlyRevenue(allPayments);

    /* ── User growth chart ── */
    const userGrowthData = buildMonthlyUsers(allUsers);

    return {
      success: true,
      data: {
        /* stats cards */
        totalRevenue:         paymentStats.totalRevenue        ?? 0,
        monthlyRevenue:       paymentStats.monthlyRevenue      ?? 0,
        activeUsers:          userStats.activeUsers            ?? allUsers.length,
        activeSubscriptions:  paymentStats.activeSubscriptions ?? 0,
        totalMovies,
        totalSeries,
        totalViews,
        totalDownloads:       0,

        /* growth % */
        revenueGrowth:        paymentStats.revenueGrowth       ?? 0,
        monthlyRevenueGrowth: paymentStats.monthlyRevenueGrowth ?? 0,
        userGrowth:           userStats.userGrowth             ?? 0,
        subscriptionGrowth:   paymentStats.subscriptionGrowth  ?? 0,
        moviesAdded:          0,
        seriesAdded:          0,
        viewsGrowth:          0,
        downloadsGrowth:      0,

        /* lists */
        topMovies,
        topSeries,
        recentTransactions,
        recentUsers,

        /* charts */
        revenueData,
        userGrowthData,
      },
    };
  } catch (e: any) {
    console.error("getDashboardStats error:", e?.message);
    return { success: false, error: e?.message, data: null };
  }
}

/* ── Helpers ─────────────────────────────────────────────────────── */

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildMonthlyRevenue(payments: any[]) {
  const now   = new Date();
  const map   = new Map<string, number>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    map.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }

  for (const p of payments) {
    if (p.status !== "COMPLETED") continue;
    const d   = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + (p.amount ?? 0));
  }

  return Array.from(map.entries()).map(([key, revenue]) => {
    const [year, month] = key.split("-").map(Number);
    return { month: `${MONTHS[month]} ${year}`, revenue };
  });
}

function buildMonthlyUsers(users: any[]) {
  const now = new Date();
  const map = new Map<string, number>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    map.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }

  for (const u of users) {
    const d   = new Date(u.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries()).map(([key, users]) => {
    const [year, month] = key.split("-").map(Number);
    return { month: `${MONTHS[month]} ${year}`, users };
  });
}
