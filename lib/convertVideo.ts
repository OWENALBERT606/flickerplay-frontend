import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Convert a .ts buffer to .mp4 using server-side FFmpeg.
 * Writes a temp input file, converts, reads the output, then cleans up both.
 * Always cleans up temp files even if conversion fails.
 */
export async function convertTsToMp4(
  buffer: Buffer,
  originalName: string
): Promise<{ buffer: Buffer; filename: string }> {
  const id = randomUUID();
  const inputPath  = join(tmpdir(), `${id}-input.ts`);
  const outputPath = join(tmpdir(), `${id}-output.mp4`);
  const filename   = originalName.replace(/\.ts$/i, ".mp4");

  await writeFile(inputPath, buffer);

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          "-c:v libx264",
          "-c:a aac",
          "-movflags faststart", // moov atom at front for streaming
          "-preset fast",
          "-crf 23",
        ])
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
        .run();
    });

    const mp4Buffer = await readFile(outputPath);
    return { buffer: mp4Buffer, filename };
  } finally {
    // Always remove both temp files — ignore errors if they don't exist
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}
