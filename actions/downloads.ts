"use server";

import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/api-config";

export async function checkDownloadLimitAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { data: null, error: "Unauthorized" };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/downloads/check-limit`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error checking download limit:", error);
    return { data: null, error: "Failed to check download limit" };
  }
}

export async function recordDownloadAction(movieId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { data: null, error: "Unauthorized" };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/downloads/record`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ movieId }),
    });

    return await res.json();
  } catch (error) {
    console.error("Error recording download:", error);
    return { data: null, error: "Failed to record download" };
  }
}
