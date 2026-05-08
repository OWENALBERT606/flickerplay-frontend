import { NextResponse } from "next/server";

/**
 * Generates PWA icons as SVG (served as image/png with correct dimensions).
 * Chrome/Edge accept SVG for PWA icons when served with the right content-type.
 * For true PNG, use a build-time script or a service like realfavicongenerator.net.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  const dim = parseInt(size) || 192;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#000000"/>
  <circle cx="256" cy="256" r="180" fill="#f97316"/>
  <polygon points="210,170 210,342 370,256" fill="#ffffff"/>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
