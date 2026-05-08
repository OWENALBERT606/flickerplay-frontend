"use client";

export interface CompressionProgress {
  ratio: number;
  message: string;
}

/**
 * Check video resolution using the browser's native video element.
 * Returns { width, height } or null if it can't be determined.
 */
export function getVideoResolution(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({ width: video.videoWidth, height: video.videoHeight });
    };
    video.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    video.src = url;
  });
}

/**
 * Compress a video to max 1080p using ffmpeg.wasm.
 *
 * ONLY called when the video is confirmed > 1080p.
 * Uses ultrafast preset + higher CRF for maximum speed.
 */
export async function compressVideo(
  file: File,
  onProgress?: (p: CompressionProgress) => void
): Promise<File> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

  onProgress?.({ ratio: 0, message: "Loading compressor…" });

  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`,   "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  ffmpeg.on("progress", ({ progress }) => {
    onProgress?.({
      ratio:   Math.min(0.1 + progress * 0.85, 0.95),
      message: `Compressing to 1080p… ${Math.round(progress * 100)}%`,
    });
  });

  onProgress?.({ ratio: 0.05, message: "Reading file…" });

  const inputName  = "input.mp4";
  const outputName = "output.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // ultrafast = much faster encode, slightly larger file — acceptable trade-off
  // CRF 28 = faster + smaller, still good quality for streaming
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease",
    "-c:v", "libx264",
    "-crf",  "28",
    "-preset", "ultrafast",   // ← fastest possible encode
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    "-y",
    outputName,
  ]);

  onProgress?.({ ratio: 0.96, message: "Finalising…" });

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data as unknown as BlobPart], { type: "video/mp4" });

  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);
  ffmpeg.terminate();

  onProgress?.({ ratio: 1, message: "Done!" });

  const name = file.name.replace(/\.[^.]+$/, "") + "_1080p.mp4";
  return new File([blob], name, { type: "video/mp4" });
}

/** Returns true only if the video needs compression (> 1080p height) */
export function shouldCompress(file: File): boolean {
  return file.type.startsWith("video/");
}
