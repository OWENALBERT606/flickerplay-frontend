import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BASE_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

interface BackendUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  imageUrl?: string;
  status?: string;
}

interface LoginSuccessPayload {
  user: BackendUser;
  accessToken: string;
  refreshToken: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    const res = await api.post("/auth/google", { code });
    const { user, accessToken, refreshToken } = res.data.data as LoginSuccessPayload;

    const isProd = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true, data: { user, accessToken, refreshToken } });

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true, secure: isProd, sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/",
    });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true, secure: isProd, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/",
    });
    response.cookies.set("userData", JSON.stringify(user), {
      httpOnly: true, secure: isProd, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Google auth error:", error?.response?.data || error);
    return NextResponse.json(
      {
        error: error?.response?.data?.error || "Google sign-in failed. Please try again.",
      },
      { status: 400 }
    );
  }
}
