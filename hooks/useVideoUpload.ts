"use client";

import { useState, useCallback } from "react";

export type UploadStatus = "idle" | "converting" | "uploading" | "done" | "error";

export interface UseVideoUploadReturn {
  upload: (file: File) => Promise<void>;
  status: UploadStatus;
  progress: number;        // 0-100 (upload progress)
  url: string | null;
  error: string | null;
  reset: () => void;
}

export function useVideoUpload(): UseVideoUploadReturn {
  const [status, setStatus]   = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [url, setUrl]         = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setUrl(null);
    setError(null);
  }, []);

  const upload = useCallback(async (file: File) => {
    setError(null);
    setUrl(null);
    setProgress(0);

    const isTsFile = file.name.toLowerCase().endsWith(".ts");

    // Show "converting" state for .ts files so the user knows FFmpeg is running
    setStatus(isTsFile ? "converting" : "uploading");

    const form = new FormData();
    form.append("file", file);

    try {
      // Use XMLHttpRequest so we get upload progress events
      const result = await new Promise<{ url: string; filename: string }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/upload");

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              setProgress(pct);
              // Once bytes are being sent, we're past the conversion phase
              if (isTsFile && pct > 0) setStatus("uploading");
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch {
                reject(new Error("Invalid JSON response from server"));
              }
            } else {
              try {
                const body = JSON.parse(xhr.responseText);
                reject(new Error(body.error ?? `Server error ${xhr.status}`));
              } catch {
                reject(new Error(`Server error ${xhr.status}`));
              }
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Network error")));
          xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

          xhr.send(form);
        }
      );

      setUrl(result.url);
      setStatus("done");
      setProgress(100);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed");
      setStatus("error");
    }
  }, []);

  return { upload, status, progress, url, error, reset };
}
