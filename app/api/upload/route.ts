import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { convertTsToMp4 } from "@/lib/convertVideo";

// ── R2 client ──────────────────────────────────────────────────────────────────
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

const BUCKET     = process.env.R2_BUCKET!;
const PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

// ── MIME helper ────────────────────────────────────────────────────────────────
function mimeFor(ext: string): string {
  const map: Record<string, string> = {
    mp4:  "video/mp4",
    webm: "video/webm",
    mov:  "video/quicktime",
    mkv:  "video/x-matroska",
    avi:  "video/x-msvideo",
    ts:   "video/MP2T",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}

// ── POST /api/upload ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const originalName = file.name;
    const ext = originalName.split(".").pop()?.toLowerCase() ?? "";
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    let uploadBuffer: Buffer;
    let uploadName: string;
    let contentType: string;

    if (ext === "ts") {
      // Convert .ts → .mp4 before uploading
      const converted = await convertTsToMp4(rawBuffer, originalName);
      uploadBuffer = converted.buffer;
      uploadName   = converted.filename;
      contentType  = "video/mp4";
    } else {
      uploadBuffer = rawBuffer;
      uploadName   = originalName;
      contentType  = mimeFor(ext);
    }

    // Sanitise key: lowercase, spaces → dashes
    const key = `videos/${Date.now()}-${uploadName.toLowerCase().replace(/\s+/g, "-")}`;

    await r2.send(
      new PutObjectCommand({
        Bucket:      BUCKET,
        Key:         key,
        Body:        uploadBuffer,
        ContentType: contentType,
      })
    );

    const url = `${PUBLIC_URL}/${key}`;
    return NextResponse.json({ url, filename: uploadName });
  } catch (err: any) {
    console.error("[upload] error:", err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}

// Tell Next.js to use Node.js runtime (fluent-ffmpeg needs it)
export const runtime = "nodejs";
