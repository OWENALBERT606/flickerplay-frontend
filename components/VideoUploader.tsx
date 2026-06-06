"use client";

import { useRef, useState } from "react";
import { useVideoUpload } from "@/hooks/useVideoUpload";

export function VideoUploader() {
  const { upload, status, progress, url, error, reset } = useVideoUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    upload(file);
  };

  const statusLabel: Record<typeof status, string> = {
    idle:       "Choose a video file or drag it here",
    converting: "Converting .ts → .mp4 (this may take a few minutes)…",
    uploading:  `Uploading… ${progress}%`,
    done:       "Upload complete!",
    error:      "",
  };

  const isActive = status === "converting" || status === "uploading";

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onClick={() => !isActive && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!isActive) handleFile(e.dataTransfer.files[0]);
        }}
        className={[
          "relative flex flex-col items-center justify-center gap-3",
          "rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer",
          dragOver        ? "border-orange-400 bg-orange-500/10"  : "",
          isActive        ? "cursor-not-allowed opacity-60"        : "hover:border-orange-400 hover:bg-orange-500/5",
          status === "done"  ? "border-green-500 bg-green-500/5"  : "",
          status === "error" ? "border-red-500 bg-red-500/5"      : "",
          !dragOver && !isActive && status === "idle" ? "border-border" : "",
        ].join(" ")}
      >
        {/* Icon */}
        <div className="text-4xl select-none">
          {status === "done"       ? "✅"
           : status === "error"   ? "❌"
           : status === "converting" ? "⚙️"
           : "🎬"}
        </div>

        <p className="text-sm font-medium text-foreground">
          {status === "error" ? error : statusLabel[status]}
        </p>

        {/* Progress bar */}
        {(status === "converting" || status === "uploading") && (
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className={[
                "h-full rounded-full transition-all duration-300",
                status === "converting"
                  ? "bg-yellow-500 animate-pulse w-full"
                  : "bg-orange-500",
              ].join(" ")}
              style={status === "uploading" ? { width: `${progress}%` } : undefined}
            />
          </div>
        )}

        {/* Final URL */}
        {status === "done" && url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 text-xs text-orange-400 underline break-all hover:text-orange-300"
          >
            {url}
          </a>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          disabled={isActive}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {/* Reset button */}
      {(status === "done" || status === "error") && (
        <button
          onClick={reset}
          className="w-full py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          Upload another video
        </button>
      )}
    </div>
  );
}
