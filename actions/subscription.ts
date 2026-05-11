"use server";

import axios from "axios";

const BASE_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: string | null;
  expiresAt: string | null;
  daysRemaining: number;
  subscriptionId: string | null;
}

export async function getUserSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus> {
  const fallback: SubscriptionStatus = {
    isSubscribed: false,
    plan: null,
    expiresAt: null,
    daysRemaining: 0,
    subscriptionId: null,
  };

  try {
    const res = await api.get(`/subscriptions/user/${userId}`);
    const subscriptions: any[] = res.data?.data || [];

    const now = new Date();
    const active = subscriptions.find(
      (s) =>
        s.status === "ACTIVE" && s.endDate && new Date(s.endDate) > now
    );

    if (!active) return fallback;

    const expiresAt = new Date(active.endDate);
    const daysRemaining = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      isSubscribed: true,
      plan: active.plan,
      expiresAt: active.endDate,
      daysRemaining,
      subscriptionId: active.id,
    };
  } catch {
    return fallback;
  }
}

export async function getFreeMoviesWatchedThisMonth(
  userId: string
): Promise<number> {
  try {
    const params = { type: "movies" };
    const res = await api.get(`/watchhistory/${userId}`, { params });
    const items = res.data?.data || [];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const uniqueMovieIds = new Set(
      items
        .filter((item: any) => {
          if (!item.movieId) return false;
          const watchedAt = new Date(item.lastWatchedAt || item.createdAt);
          return watchedAt >= startOfMonth;
        })
        .map((item: any) => item.movieId)
    );

    return uniqueMovieIds.size;
  } catch {
    return 0;
  }
}
