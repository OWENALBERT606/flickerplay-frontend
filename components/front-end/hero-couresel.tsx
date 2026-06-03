
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Star, ChevronLeft, ChevronRight, Film, Tv } from "lucide-react";
import { cleanTitle } from "@/lib/utils";
import type { Movie } from "@/actions/movies";
import type { Series } from "@/actions/series";

type HeroItem = Movie | Series;

interface HeroCarouselProps {
  items: HeroItem[];
  userId: string | null | undefined;
}

function isMovie(item: HeroItem): item is Movie {
  return !("totalSeasons" in item);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MiniCard({
  item,
  isActive,
  onClick,
}: {
  item: HeroItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const movie = isMovie(item);
  const poster = (item.trailerPoster || item.poster || "").trim();
  const link = movie ? `/movies/${item.slug}` : `/series/${(item as Series).slug}`;
  const Icon = movie ? Film : Tv;

  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center gap-2 bg-card/60 backdrop-blur-sm rounded-xl p-2 border border-border/30 hover:border-orange-500/40 transition-colors text-left"
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-11 h-16 rounded-lg overflow-hidden bg-muted">
        {poster && (
          <Image src={poster} alt={item.title} fill sizes="44px" className="object-cover" />
        )}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Link
              href={link}
              onClick={(e) => e.stopPropagation()}
              className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0"
            >
              <Play className="w-3 h-3 fill-white text-white ml-0.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate leading-tight">
          {cleanTitle(item.title)}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-[10px] text-muted-foreground truncate">
            {item.year.value} | {item.genre.name}
          </span>
        </div>
        {isActive && (
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400 shrink-0" />
            <span className="text-[10px] text-yellow-400">{item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </button>
  );
}

export function HeroCarousel({ items, userId }: HeroCarouselProps) {
  const filtered = items.filter((item) => !!(item.trailerPoster || item.poster));

  const [shuffled, setShuffled] = useState<HeroItem[]>(filtered);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setShuffled(shuffle(filtered));
    setCurrentIndex(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const prev = () => goTo((currentIndex - 1 + shuffled.length) % shuffled.length);
  const next = () => goTo((currentIndex + 1) % shuffled.length);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 6000);
  };

  useEffect(() => {
    resetInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [currentIndex, shuffled.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (shuffled.length === 0) return null;

  const current = shuffled[currentIndex];
  const nextItem = shuffled[(currentIndex + 1) % shuffled.length];
  const movie = isMovie(current);
  const link = movie ? `/movies/${current.slug}` : `/series/${(current as Series).slug}`;
  const poster = (current.trailerPoster || current.poster || "").trim();

  return (
    <div className="relative h-[55vh] md:h-[85vh] w-full overflow-hidden">
      {/* Background */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={poster}
          alt={current.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div
        className={`relative h-full flex items-end md:items-center pb-28 md:pb-0 transition-opacity duration-500 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="container mx-auto px-4 md:px-12 lg:px-24">
          <div className="max-w-2xl space-y-3 md:space-y-6">
            {/* Type badge */}
            <Badge variant="outline" className="w-fit">
              {movie ? (
                <><Film className="w-4 h-4 mr-2" />Movie</>
              ) : (
                <><Tv className="w-4 h-4 mr-2" />TV Series</>
              )}
            </Badge>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white drop-shadow-lg leading-tight">
              {cleanTitle(current.title)}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-white/90 text-sm md:text-base">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{current.rating.toFixed(1)}</span>
              </div>
              <span>{current.year.value}</span>
              <span>{current.genre.name}</span>
              {!movie && (
                <span>
                  {(current as Series).totalSeasons} Season
                  {(current as Series).totalSeasons !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Description — hidden on mobile to save space */}
            <p className="hidden md:block text-lg text-white/90 line-clamp-3 leading-relaxed">
              {current.description}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-1 md:pt-4">
              <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white md:text-lg md:px-8 md:py-6"
                asChild
              >
                <Link href={link}>
                  <Play className="w-4 h-4 mr-1.5 fill-white" />
                  {current.isComingSoon ? "View Details" : "Watch Now"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-9 h-9 md:w-12 md:h-12"
        onClick={() => { prev(); resetInterval(); }}
      >
        <ChevronLeft className="w-5 h-5 md:w-8 md:h-8" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-9 h-9 md:w-12 md:h-12"
        onClick={() => { next(); resetInterval(); }}
      >
        <ChevronRight className="w-5 h-5 md:w-8 md:h-8" />
      </Button>

      {/* Desktop dots */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 gap-2">
        {shuffled.slice(0, 10).map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); resetInterval(); }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIndex ? "bg-orange-500 w-8" : "bg-white/40 w-2 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Mobile mini-cards row */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 flex gap-2 px-3 pb-3 pt-8 bg-gradient-to-t from-background via-background/95 to-transparent">
        <MiniCard
          item={current}
          isActive
          onClick={() => { goTo(currentIndex); resetInterval(); }}
        />
        <MiniCard
          item={nextItem}
          isActive={false}
          onClick={() => { next(); resetInterval(); }}
        />
      </div>
    </div>
  );
}
