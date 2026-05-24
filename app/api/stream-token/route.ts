import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("id");
  if (!videoId) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const res = await fetch("https://www.labafilm.com/api/generate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://www.labafilm.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({ videoId, type: "movie" }),
    });

    if (!res.ok) return NextResponse.json({ error: "token fetch failed" }, { status: 502 });

    const { downloadUrl } = await res.json();
    if (!downloadUrl) return NextResponse.json({ error: "no url returned" }, { status: 502 });

    return NextResponse.json({ streamUrl: downloadUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
