"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload, Video, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { compressVideo, shouldCompress } from "@/lib/video-compress";
import type { FileWithMetadata } from "@/components/ui/dropzone";

interface VideoDropzoneProps {
  onFilesChange?: (files: FileWithMetadata[]) => void;
  disabled?: boolean;
  maxSize?: number; // bytes, default 5GB
  label?: string;
}

type Stage = "idle" | "compressing" | "uploading" | "done" | "error";

export function VideoDropzone({
  onFilesChange,
  disabled = false,
  maxSize = 1024 * 1024 * 1024 * 5,
  label = "Full Movie Video",
}: VideoDropzoneProps) {
  const [stage, setStage]           = useState<Stage>("idle");
  const [progress, setProgress]     = useState(0);
  const [statusMsg, setStatusMsg]   = useState("");
  const [fileName, setFileName]     = useState("");
  const [fileSize, setFileSize]     = useState("");
  const [compressedSize, setCompressedSize] = useState("");

  const formatBytes = (b: number) =>
    b >= 1e9 ? `${(b / 1e9).toFixed(2)} GB`
    : b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB`
    : `${(b / 1e3).toFixed(0)} KB`;

  const processFile = useCallback(async (raw: File) => {
    setFileName(raw.name);
    setFileSize(formatBytes(raw.size));
    setStage("compressing");
    setProgress(0);

    let fileToUpload = raw;

    // ── Step 1: Compress if video ──
    if (shouldCompress(raw)) {
      try {
        setStatusMsg("Loading video processor…");
        fileToUpload = await compressVideo(raw, ({ ratio, message }) => {
          setProgress(Math.round(ratio * 60)); // compression = 0–60%
          setStatusMsg(message);
        });
        setCompressedSize(formatBytes(fileToUpload.size));
        toast.success(`Compressed: ${formatBytes(raw.size)} → ${formatBytes(fileToUpload.size)}`);
      } catch (err: any) {
        console.error("Compression failed, uploading original:", err);
        toast.warning("Compression failed — uploading original file");
        fileToUpload = raw;
      }
    }

    // ── Step 2: Get presigned URL ──
    setStage("uploading");
    setStatusMsg("Getting upload URL…");
    setProgress(62);

    let presignedUrl = "";
    let key = "";
    let publicUrl = "";

    try {
      const res = await fetch("/api/r2/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename:    fileToUpload.name,
          contentType: fileToUpload.type,
          size:        fileToUpload.size,
        }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      ({ presignedUrl, key, publicUrl } = await res.json());
    } catch (err: any) {
      setStage("error");
      setStatusMsg("Failed to get upload URL");
      toast.error("Upload failed: could not get upload URL");
      return;
    }

    // ── Step 3: Upload with progress ──
    setStatusMsg("Uploading to cloud…");

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = 62 + Math.round((e.loaded / e.total) * 36); // 62–98%
          setProgress(pct);
          setStatusMsg(`Uploading… ${Math.round((e.loaded / e.total) * 100)}%`);
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 204) resolve();
        else reject(new Error(`Upload failed: ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", fileToUpload.type);
      xhr.send(fileToUpload);
    }).catch((err) => {
      setStage("error");
      setStatusMsg("Upload failed");
      toast.error("Upload failed");
      throw err;
    });

    // ── Done ──
    setProgress(100);
    setStage("done");
    setStatusMsg("Upload complete!");
    toast.success("Video uploaded successfully!");

    const meta: FileWithMetadata = {
      id:        uuidv4(),
      file:      fileToUpload,
      uploading: false,
      progress:  100,
      key,
      publicUrl,
      isDeleting: false,
      error:     false,
    };
    onFilesChange?.([meta]);
  }, [onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => { if (accepted[0]) processFile(accepted[0]); },
    maxFiles: 1,
    maxSize,
    accept: { "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"] },
    disabled: disabled || stage === "compressing" || stage === "uploading",
  });

  const busy = stage === "compressing" || stage === "uploading";

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer
          ${isDragActive ? "border-orange-500 bg-orange-500/5" : "border-border hover:border-orange-400"}
          ${busy || stage === "done" ? "pointer-events-none" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />

        {/* Idle / drag state */}
        {stage === "idle" && (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="font-medium text-sm">
                {isDragActive ? "Drop video here" : "Drag & drop video or click to select"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                MP4, MOV, AVI, MKV — will be compressed to 1080p before upload
              </p>
            </div>
          </div>
        )}

        {/* Compressing / uploading */}
        {busy && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-orange-500 animate-spin shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground">{statusMsg}</p>
              </div>
              <span className="text-sm font-bold text-orange-500 shrink-0">{progress}%</span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Original: {fileSize}</span>
              {compressedSize && <span>Compressed: {compressedSize}</span>}
            </div>
          </div>
        )}

        {/* Done */}
        {stage === "done" && (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-600">Upload complete</p>
              <p className="text-xs text-muted-foreground truncate">{fileName}</p>
              {compressedSize && (
                <p className="text-xs text-muted-foreground">
                  {fileSize} → {compressedSize} (1080p)
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setStage("idle"); setProgress(0); setFileName(""); setCompressedSize(""); onFilesChange?.([]); }}
              className="text-xs text-muted-foreground hover:text-foreground underline shrink-0"
            >
              Replace
            </button>
          </div>
        )}

        {/* Error */}
        {stage === "error" && (
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Upload failed</p>
              <p className="text-xs text-muted-foreground">{statusMsg}</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setStage("idle"); }}
              className="text-xs text-orange-500 hover:text-orange-600 underline shrink-0"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
