"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteWatchHistoryItem, WatchHistoryItem } from "@/actions/watchHistory";

interface ContinueWatchingContentProps {
  items: WatchHistoryItem[];
  userId: string;
}

export function ContinueWatchingContent({ items: initialItems, userId }: ContinueWatchingContentProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);

  const handleRemove = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await deleteWatchHistoryItem(id);
    if (result.success) {
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success("Removed");
      router.refresh();
    } else {
      toast.error("Failed to remove");
    }
  };

  const getItemDetails = (item: WatchHistoryItem) => {
    if (item.movie) {
      return {
        title:    item.movie.title,
        subtitle: "Movie",
        image:    item.movie.poster,
        link:     `/movies/${item.movie.slug}`,
      };
    }
    if (item.episode?.season?.series) {
      const s = item.episode.season.series;
      return {
        title:    s.title,
        subtitle: `S${item.episode.season.seasonNumber} E${item.episode.episodeNumber}`,
        image:    s.poster,
        link:     `/series/${s.slug}/watch?season=${item.episode.season.seasonNumber}&episode=${item.episode.episodeNumber}`,
      };
    }
    return null;
  };

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-base font-bold mb-3 text-foreground">Continue Watching</h2>

      {/* 4 compact landscape cards — always one row */}
      <div className="grid grid-cols-4 gap-3">
        {items.slice(0, 4).map(item => {
          const details = getItemDetails(item);
          if (!details) return null;

          return (
            <div key={item.id} className="group relative">
              <Link href={details.link} className="block">
                {/* 16:9 thumbnail */}
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={details.image}
                    alt={details.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="mt-1.5 px-0.5">
                  <p className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-orange-500 transition-colors">
                    {details.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{details.subtitle}</p>
                </div>
              </Link>

              {/* Remove ✕ */}
              <button
                onClick={e => handleRemove(item.id, e)}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 z-10"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
