import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED = ["f006.backblazeb2.com", "cdn.tulabe.com"];

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl) return new Response("url required", { status: 400 });

  let target: string;
  try {
    target = decodeURIComponent(rawUrl);
    const { hostname } = new URL(target);
    if (!ALLOWED.some((h) => hostname.endsWith(h))) {
      return new Response("Host not allowed", { status: 403 });
    }
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(target, { next: { revalidate: 0 } });
  } catch (e: any) {
    return new Response(`Upstream error: ${e.message}`, { status: 502 });
  }
  if (!upstream.ok) return new Response(null, { status: upstream.status });

  const ct = upstream.headers.get("content-type") ?? "application/octet-stream";
  const isPlaylist = target.includes(".m3u8") || ct.includes("mpegurl");

  if (isPlaylist) {
    const text = await upstream.text();
    const base = target.substring(0, target.lastIndexOf("/") + 1);

    const rewritten = text
      .split("\n")
      .map((line) => {
        const t = line.trim();
        if (!t || t.startsWith("#")) return line;
        const segUrl = t.startsWith("http") ? t : `${base}${t}`;
        return `/api/tx-proxy?url=${encodeURIComponent(segUrl)}`;
      })
      .join("\n");

    return new Response(rewritten, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Binary (TS segment or image)
  const body = await upstream.arrayBuffer();
  return new Response(body, {
    headers: {
      "Content-Type": ct === "video/vnd.dlna.mpeg-tts" ? "video/MP2T" : ct,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
