import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/r2Client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") || "download";

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const publicBase = (process.env.CLOUDFLARE_R2_PUBLIC_URL || "").replace(/\/$/, "");

  if (!url.startsWith(publicBase)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Extract the object key (URL-decode it since R2 stores the raw key)
  const key = decodeURIComponent(url.slice(publicBase.length + 1));

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${filename.replace(/"/g, "'")}"`,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

    return NextResponse.redirect(presignedUrl);
  } catch (error) {
    console.error("Download presign error:", error);
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
  }
}
