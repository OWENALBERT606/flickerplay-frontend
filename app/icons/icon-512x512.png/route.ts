import { NextResponse } from "next/server";

export async function GET() {
  const size = 512;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#000000"/>
  <circle cx="256" cy="256" r="180" fill="#f97316"/>
  <polygon points="210,170 210,342 370,256" fill="#ffffff"/>
</svg>`;
  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=31536000" },
  });
}
