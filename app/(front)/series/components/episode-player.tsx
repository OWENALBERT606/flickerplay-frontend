"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { incrementEpisodeViews } from "@/actions/series";
import { NetflixPlayer, type NextItem } from "@/components/front-end/netflix-player";
import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward } from "lucide-react";

interface EpisodePlayerProps {
  episode: any;
  series: any;
  season: any;
  userId?: string;
  initialProgress?: number;
}

export function EpisodePlayer({
  episode,
  series,
  season,
  userId,
  initialProgress = 0,
}: EpisodePlayerProps) {
  const router = useRouter();
  const [hasTrackedView, setHasTrackedView] = useState(false);

  /* ── View tracking after 30 s ── */
  useEffect(() => {
    const t = setTimeout(() => {
      if (!hasTrackedView) {
        incrementEpisodeViews(episode.id).catch(console.error);
        setHasTrackedView(true);
      }
    }, 30_000);
    return () => clearTimeout(t);
  }, [episode.id, hasTrackedView]);

  /* ── Navigation helpers ── */
  const hasPrevious = episode.episodeNumber > 1 || season.seasonNumber > 1;
  const hasNext =
    episode.episodeNumber < season.totalEpisodes ||
    season.seasonNumber < series.totalSeasons;

  const prevHref = (() => {
    if (episode.episodeNumber > 1)
      return `/series/${series.slug}/watch?season=${season.seasonNumber}&episode=${episode.episodeNumber - 1}`;
    const prev = series.seasons?.find((s: any) => s.seasonNumber === season.seasonNumber - 1);
    if (prev) return `/series/${series.slug}/watch?season=${prev.seasonNumber}&episode=${prev.totalEpisodes}`;
    return null;
  })();

  const nextHref = (() => {
    if (episode.episodeNumber < season.totalEpisodes)
      return `/series/${series.slug}/watch?season=${season.seasonNumber}&episode=${episode.episodeNumber + 1}`;
    const next = series.seasons?.find((s: any) => s.seasonNumber === season.seasonNumber + 1);
    if (next) return `/series/${series.slug}/watch?season=${next.seasonNumber}&episode=1`;
    return null;
  })();

  const nextItem: NextItem | undefined = nextHref
    ? {
        label: `S${season.seasonNumber} E${episode.episodeNumber + 1 <= season.totalEpisodes
          ? episode.episodeNumber + 1
          : 1} · Next Episode`,
        href: nextHref,
      }
    : undefined;

  const handleDownload = () => {
    const src = episode.downloadUrl || episode.videoUrl;
    if (!src) { toast.error("Download not available"); return; }
    const filename = `${series.title.replace(/[^a-z0-9]/gi, "_")}_S${String(season.seasonNumber).padStart(2, "0")}E${String(episode.episodeNumber).padStart(2, "0")}.mp4`;
    const a = document.createElement("a");
    a.href = src; a.download = filename; a.target = "_blank";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success("Download started");
  };

  return (
    <div className="bg-black min-h-screen">
      {/* ── Player ── */}
      <NetflixPlayer
        src={episode.videoUrl}
        poster={episode.poster || season.poster || series.poster}
        title={series.title}
        subtitle={`Season ${season.seasonNumber} · Episode ${episode.episodeNumber}${episode.title ? ` · ${episode.title}` : ""}`}
        backHref={`/series/${series.slug}`}
        userId={userId}
        itemId={episode.id}
        itemType="episode"
        initialProgress={initialProgress}
        nextItem={nextItem}
        onEnded={() => nextHref && router.push(nextHref)}
        autoPlay
      />

      {/* ── Below-player info & nav ── */}
      <div className="px-4 md:px-8 lg:px-12 py-6 bg-black">
        <div className="max-w-5xl mx-auto">
          {/* Episode title */}
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{episode.title}</h2>
          <p className="text-white/50 text-sm mb-4">
            Season {season.seasonNumber} · Episode {episode.episodeNumber}
            {episode.length && ` · ${episode.length}`}
          </p>
          {episode.description && (
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-3xl line-clamp-3">
              {episode.description}
            </p>
          )}

          {/* Nav + download */}
          <div className="flex items-center gap-3 flex-wrap">
            {hasPrevious && prevHref && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(prevHref)}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <SkipBack className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            {hasNext && nextHref && (
              <Button
                size="sm"
                onClick={() => router.push(nextHref)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Next Episode
                <SkipForward className="w-4 h-4 ml-2" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white ml-auto"
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
