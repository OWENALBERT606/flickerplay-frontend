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

    // Set cookies
    const response = NextResponse.json({
      success: true,
      data: { user, accessToken, refreshToken },
    });

    // Set cookies on the response
    const cookieHeaders = new Headers();
    cookieHeaders.append(
      "Set-Cookie",
      `accessToken=${accessToken}; HttpOnly; Secure=${process.env.NODE_ENV === "production"}; SameSite=Lax; Max-Age=604800; Path=/`
    );
    cookieHeaders.append(
      "Set-Cookie",
      `refreshToken=${refreshToken}; HttpOnly; Secure=${process.env.NODE_ENV === "production"}; SameSite=Lax; Max-Age=2592000; Path=/`
    );
    cookieHeaders.append(
      "Set-Cookie",
      `userData=${JSON.stringify(user)}; HttpOnly; Secure=${process.env.NODE_ENV === "production"}; SameSite=Lax; Max-Age=2592000; Path=/`
    );

    response.headers.set("Set-Cookie", cookieHeaders.get("Set-Cookie") || "");

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
