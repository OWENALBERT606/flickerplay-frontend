"use client";

/**
 * Compresses a video file to max 1080p using ffmpeg.wasm (runs entirely in the browser).
 * - If the video is already ≤1080p, it re-encodes at the same resolution with optimised bitrate.
 * - Uses H.264 + AAC, CRF 23 (visually lossless quality), preset "fast".
 * - Returns a new File object ready for upload.
 */

export interface CompressionProgress {
  ratio: number;   // 0–1
  message: string;
}

export async function compressVideo(
  file: File,
  onProgress?: (p: CompressionProgress) => void
): Promise<File> {
  // Dynamic import — ffmpeg.wasm is large, only load when needed
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

  onProgress?.({ ratio: 0, message: "Loading video processor…" });

  const ffmpeg = new FFmpeg();

  // Load ffmpeg core from CDN (avoids bundling the large WASM binary)
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL:   await toBlobURL(`${baseURL}/ffmpeg-core.js`,   "text/javascript"),
    wasmURL:   await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  ffmpeg.on("progress", ({ progress }) => {
    onProgress?.({
      ratio:   Math.min(progress, 1),
      message: `Compressing… ${Math.round(progress * 100)}%`,
    });
  });

  onProgress?.({ ratio: 0.05, message: "Reading video file…" });

  const inputName  = "input.mp4";
  const outputName = "output.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  onProgress?.({ ratio: 0.1, message: "Compressing to 1080p…" });

  // -vf scale: scale down to max 1920×1080, keep aspect ratio, only if larger
  // -crf 23: high quality (lower = better, 18–28 is typical range)
  // -preset fast: good speed/quality balance
  // -movflags +faststart: optimise for web streaming (moov atom at start)
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease",
    "-c:v", "libx264",
    "-crf",  "23",
    "-preset", "fast",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    "-y",
    outputName,
  ]);

  onProgress?.({ ratio: 0.95, message: "Finalising…" });

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data], { type: "video/mp4" });

  // Clean up
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);
  ffmpeg.terminate();

  onProgress?.({ ratio: 1, message: "Compression complete!" });

  // Return as File with original name but .mp4 extension
  const compressedName = file.name.replace(/\.[^.]+$/, "") + "_1080p.mp4";
  return new File([blob], compressedName, { type: "video/mp4" });
}

/** Returns true if the file is a video that should be compressed */
export function shouldCompress(file: File): boolean {
  return file.type.startsWith("video/");
}
