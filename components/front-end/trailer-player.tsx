"use client";

/** Extract YouTube video ID from any YouTube URL format */
export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

interface TrailerPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  className?: string;
}

/**
 * Smart trailer player:
 * - YouTube URLs → renders an <iframe> embed (plays directly from YouTube, only URL stored in DB)
 * - Direct video files (MP4 etc.) → renders a <video> element
 */
export function TrailerPlayer({ url, title = "Trailer", poster, className = "" }: TrailerPlayerProps) {
  if (!url) return null;

  const youtubeId = getYouTubeId(url);

  return (
    <div className={`relative aspect-video w-full rounded-lg overflow-hidden bg-black ${className}`}>
      {youtubeId ? (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      ) : (
        <video
          src={url}
          controls
          poster={poster}
          className="w-full h-full"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
