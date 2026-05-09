"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  movieId: string;
}

export function VideoPlayer({ movieId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef   = useRef<import("hls.js").default | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stream/${movieId}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          throw new Error(
            res.status === 401 ? "Please log in to watch" : "Failed to load video"
          );
        }

        const json = await res.json();
        const url: string = json?.data?.url ?? json?.url;

        if (!url) throw new Error("No stream URL returned");
        if (cancelled || !videoRef.current) return;

        const video = videoRef.current;

        const { default: Hls } = await import("hls.js");

        if (Hls.isSupported()) {
          const hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            startLevel: -1,
            abrEwmaDefaultEstimate: 5_000_000,
          });
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => setLoading(false));
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal && !cancelled) setError("Playback error. Please try again.");
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          video.addEventListener("loadedmetadata", () => setLoading(false), { once: true });
        } else {
          // Plain URL fallback (MP4 / non-HLS)
          video.src = url;
          video.addEventListener("loadedmetadata", () => setLoading(false), { once: true });
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Could not load video");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [movieId]);

  if (error) {
    return (
      <div className="flex items-center justify-center aspect-video bg-black text-white text-sm rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
      />
    </div>
  );
}
