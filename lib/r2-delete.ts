"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2Client";

const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || "";
const BUCKET     = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";

/** Extract the R2 object key from a public URL */
function extractKey(url: string): string | null {
  if (!url || !PUBLIC_URL) return null;
  try {
    // URL format: https://pub-xxx.r2.dev/uuid-filename.ext
    const base = PUBLIC_URL.endsWith("/") ? PUBLIC_URL : PUBLIC_URL + "/";
    if (!url.startsWith(base)) return null;
    return decodeURIComponent(url.slice(base.length));
  } catch {
    return null;
  }
}

/** Delete a single R2 object by its public URL. Silently ignores errors. */
export async function deleteR2File(publicUrl: string): Promise<void> {
  const key = extractKey(publicUrl);
  if (!key) return;
  try {
    await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    console.log(`[r2] Deleted: ${key}`);
  } catch (e: any) {
    console.error(`[r2] Failed to delete ${key}:`, e.message);
  }
}

/** Delete multiple R2 objects in parallel. Never throws. */
export async function deleteR2Files(urls: (string | null | undefined)[]): Promise<void> {
  const valid = urls.filter((u): u is string => !!u);
  await Promise.allSettled(valid.map(deleteR2File));
}
