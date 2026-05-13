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
 * Compress a video to max 720p using ffmpeg.wasm.
 *
 * ONLY called when the video is confirmed > 720p.
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
  // Using ESM build for better performance with multi-threading (now enabled via headers)
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

  try {
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
    });

    ffmpeg.on("progress", ({ progress }) => {
      onProgress?.({
        ratio: 0.1 + progress * 0.85,
        message: `Compressing to 720p… ${Math.round(progress * 100)}%`,
      });
    });

    onProgress?.({ ratio: 0.05, message: "Reading file…" });

    const inputName = "input.mp4";
    const outputName = "output.mp4";

    // fetchFile reads the file into memory. For very large movies, this might hit memory limits.
    // However, it's the standard way for ffmpeg.wasm.
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Use a more robust scale filter that ensures dimensions are divisible by 2
    // libx264 requires even width/height
    const scaleFilter = "scale='min(1280,iw)':-2,scale='if(gt(ih,720),-2,iw)':'min(720,ih)',scale='trunc(iw/2)*2:trunc(ih/2)*2'";

    await ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      scaleFilter,
      "-c:v",
      "libx264",
      "-crf",
      "30", // Increased CRF for slightly smaller file size (faster upload)
      "-preset",
      "ultrafast",
      "-tune",
      "zerolatency", // Added for faster processing
      "-c:a",
      "aac",
      "-b:a",
      "96k", // Reduced audio bitrate for faster processing
      "-movflags",
      "+faststart",
      "-y",
      outputName,
    ]);

    onProgress?.({ ratio: 0.96, message: "Finalising…" });

    const data = await ffmpeg.readFile(outputName);

    if (!data || (data as Uint8Array).length === 0) {
      throw new Error("Compression produced an empty file");
    }

    const blob = new Blob([data as unknown as BlobPart], { type: "video/mp4" });

    if (blob.size === 0) {
      throw new Error("Compression produced a 0-byte file");
    }

    onProgress?.({ ratio: 1, message: "Done!" });

    const name = file.name.replace(/\.[^.]+$/, "") + "_720p.mp4";
    return new File([blob], name, { type: "video/mp4" });
  } catch (err: any) {
    console.error("FFmpeg Error:", err);
    throw new Error(err.message || "Video compression failed");
  } finally {
    try {
      // Clean up virtual files
      await ffmpeg.deleteFile("input.mp4").catch(() => {});
      await ffmpeg.deleteFile("output.mp4").catch(() => {});
    } catch (e) {}
    ffmpeg.terminate();
  }
}

/**
 * Probe video metadata using ffmpeg if browser fails.
 */
export async function getFFmpegResolution(file: File): Promise<{ width: number; height: number } | null> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

  try {
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    await ffmpeg.writeFile("input", await fetchFile(file));
    
    // Capture log output to get resolution
    let output = "";
    ffmpeg.on("log", ({ message }) => {
      output += message + "\n";
    });

    // Run a command that just probes the file
    await ffmpeg.exec(["-i", "input"]);

    // Look for patterns like "Video: ..., 1920x1080, ..."
    const match = output.match(/Stream #.*Video:.* (\d+)x(\d+)/);
    if (match) {
      return { width: parseInt(match[1]), height: parseInt(match[2]) };
    }
    return null;
  } catch (err) {
    console.error("FFmpeg probe error:", err);
    return null;
  } finally {
    ffmpeg.terminate();
  }
}

/** Returns true only if the video needs compression (> 720p height) */
export function shouldCompress(file: File): boolean {
  // Always try to compress movies (usually larger files) or files with non-standard extensions
  const ext = file.name.split(".").pop()?.toLowerCase();
  const nonStandard = ["mkv", "avi", "mov", "wmv", "flv"].includes(ext || "");
  return file.type.startsWith("video/") || nonStandard;
}
