"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2Client";

const PUBLIC_URL = (process.env.CLOUDFLARE_R2_PUBLIC_URL || "").replace(/\/$/, "");
const BUCKET     = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";

/** Extract the R2 object key from a public URL.
 *  Works via configured PUBLIC_URL, or by parsing any *.r2.dev URL directly. */
function extractKey(url: string): string | null {
  if (!url) return null;
  try {
    // Primary: match against configured public base URL
    if (PUBLIC_URL && url.startsWith(PUBLIC_URL + "/")) {
      return decodeURIComponent(url.slice(PUBLIC_URL.length + 1));
    }
    // Fallback: any r2.dev URL — extract the path segment as the key
    const parsed = new URL(url);
    if (parsed.hostname.endsWith("r2.dev")) {
      return decodeURIComponent(parsed.pathname.slice(1)); // strip leading /
    }
    console.warn(`[r2-delete] URL not recognised as R2: ${url}`);
    return null;
  } catch {
    console.warn(`[r2-delete] Invalid URL: ${url}`);
    return null;
  }
}

/** Delete a single R2 object by its public URL. */
export async function deleteR2File(publicUrl: string): Promise<void> {
  if (!BUCKET) {
    console.error("[r2-delete] CLOUDFLARE_R2_BUCKET_NAME is not set");
    return;
  }
  const key = extractKey(publicUrl);
  if (!key) {
    console.warn(`[r2-delete] Skipping (no key extracted): ${publicUrl}`);
    return;
  }
  try {
    await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    console.log(`[r2-delete] ✓ Deleted: ${key}`);
  } catch (e: any) {
    console.error(`[r2-delete] ✗ Failed to delete "${key}":`, e.message);
  }
}

/** Delete multiple R2 objects in parallel. Never throws. */
export async function deleteR2Files(urls: (string | null | undefined)[]): Promise<void> {
  const valid = urls.filter((u): u is string => !!u);
  if (valid.length === 0) return;
  console.log(`[r2-delete] Deleting ${valid.length} file(s)...`);
  await Promise.allSettled(valid.map(deleteR2File));
}
