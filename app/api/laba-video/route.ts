import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_HOST = "labacdn.xyz";

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl) return new Response("url required", { status: 400 });

  let target: string;
  try {
    target = decodeURIComponent(rawUrl);
    const { hostname } = new URL(target);
    if (!hostname.endsWith(ALLOWED_HOST)) {
      return new Response("Host not allowed", { status: 403 });
    }
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  const upstreamHeaders: Record<string, string> = {
    Referer: "https://www.labafilm.com/",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "*/*",
    "Accept-Encoding": "identity",
  };

  // Forward Range header so the browser can seek
  const range = req.headers.get("range");
  if (range) upstreamHeaders["Range"] = range;

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(target, { headers: upstreamHeaders });
  } catch (e: any) {
    return new Response(`Upstream error: ${e.message}`, { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new Response(null, { status: upstream.status });
  }

  const resHeaders = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Accept-Ranges": "bytes",
  });

  const ct = upstream.headers.get("content-type");
  if (ct) resHeaders.set("Content-Type", ct);

  const cl = upstream.headers.get("content-length");
  if (cl) resHeaders.set("Content-Length", cl);

  const cr = upstream.headers.get("content-range");
  if (cr) resHeaders.set("Content-Range", cr);

  // Stream the body directly — never buffer the whole file in memory
  return new Response(upstream.body as BodyInit, {
    status: upstream.status,
    headers: resHeaders,
  });
}
