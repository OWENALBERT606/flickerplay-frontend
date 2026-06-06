import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { convertTsToMp4 } from "@/lib/convertVideo";

// ── R2 config — supports both naming conventions ───────────────────────────────
const R2_ENDPOINT   = process.env.CLOUDFLARE_R2_ENDPOINT        ?? process.env.R2_ENDPOINT   ?? "";
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID   ?? process.env.R2_ACCESS_KEY  ?? "";
const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? process.env.R2_SECRET_KEY ?? "";
const R2_BUCKET     = process.env.CLOUDFLARE_R2_BUCKET_NAME     ?? process.env.R2_BUCKET      ?? "";
const R2_PUBLIC_URL = (process.env.CLOUDFLARE_R2_PUBLIC_URL     ?? process.env.R2_PUBLIC_URL  ?? "").replace(/\/$/, "");

function makeClient() {
  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_KEY },
  });
}

function mimeFor(ext: string): string {
  const map: Record<string, string> = {
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
    mkv: "video/x-matroska", avi: "video/x-msvideo", ts: "video/MP2T",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}

// ── GET /api/upload/test — diagnose env + R2 connectivity ─────────────────────
export async function GET() {
  const cfg = {
    CLOUDFLARE_R2_ENDPOINT:          R2_ENDPOINT   ? "✓ set" : "✗ MISSING",
    CLOUDFLARE_R2_ACCESS_KEY_ID:     R2_ACCESS_KEY ? "✓ set" : "✗ MISSING",
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: R2_SECRET_KEY ? "✓ set" : "✗ MISSING",
    CLOUDFLARE_R2_BUCKET_NAME:       R2_BUCKET     ? `✓ "${R2_BUCKET}"` : "✗ MISSING",
    CLOUDFLARE_R2_PUBLIC_URL:        R2_PUBLIC_URL || "✗ MISSING",
  };

  if (!R2_ENDPOINT || !R2_ACCESS_KEY || !R2_SECRET_KEY || !R2_BUCKET) {
    return NextResponse.json({ ok: false, config: cfg, error: "Missing env vars" });
  }

  try {
    await makeClient().send(new HeadBucketCommand({ Bucket: R2_BUCKET }));
    return NextResponse.json({ ok: true, config: cfg, message: "R2 connection successful" });
  } catch (err: any) {
    return NextResponse.json({ ok: false, config: cfg, error: err?.message });
  }
}

// ── POST /api/upload ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Fail fast with clear message if any credential is missing
  if (!R2_ENDPOINT || !R2_ACCESS_KEY || !R2_SECRET_KEY || !R2_BUCKET) {
    const missing = [
      !R2_ENDPOINT   && "CLOUDFLARE_R2_ENDPOINT",
      !R2_ACCESS_KEY && "CLOUDFLARE_R2_ACCESS_KEY_ID",
      !R2_SECRET_KEY && "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
      !R2_BUCKET     && "CLOUDFLARE_R2_BUCKET_NAME",
    ].filter(Boolean).join(", ");
    return NextResponse.json({ error: `Missing env vars: ${missing}` }, { status: 500 });
  }

  let file: File | null = null;

  try {
    const form = await req.formData();
    const raw  = form.get("file");

    if (!raw || typeof raw === "string") {
      return NextResponse.json({ error: "No file field in form data" }, { status: 400 });
    }

    file = raw as File;
    console.log(`[upload] received: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    let uploadBuffer: Buffer;
    let uploadName:   string;
    let contentType:  string;

    if (ext === "ts") {
      console.log("[upload] converting .ts → .mp4 …");
      const converted = await convertTsToMp4(rawBuffer, file.name);
      uploadBuffer = converted.buffer;
      uploadName   = converted.filename;
      contentType  = "video/mp4";
      console.log(`[upload] conversion done: ${(uploadBuffer.length / 1024 / 1024).toFixed(1)} MB`);
    } else {
      uploadBuffer = rawBuffer;
      uploadName   = file.name;
      contentType  = mimeFor(ext);
    }

    const key = `videos/${Date.now()}-${uploadName.toLowerCase().replace(/\s+/g, "-")}`;
    console.log(`[upload] uploading to R2: ${key}`);

    await makeClient().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET, Key: key, Body: uploadBuffer, ContentType: contentType,
      })
    );

    const url = `${R2_PUBLIC_URL}/${key}`;
    console.log(`[upload] done: ${url}`);
    return NextResponse.json({ url, filename: uploadName });

  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[upload] FAILED:", msg);
    // Return the real error message so the UI can display it
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const runtime = "nodejs";
