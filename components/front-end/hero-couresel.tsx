
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Star, ChevronLeft, ChevronRight, Film, Tv } from "lucide-react";
import type { Movie } from "@/actions/movies";
import type { Series } from "@/actions/series";
import { AddToListButton } from "@/app/(front)/movies/components/add-to-list-button";

type HeroItem = Movie | Series;

interface HeroCarouselProps {
  items: HeroItem[];
  userId: string | null | undefined;
}

function isMovie(item: HeroItem): item is Movie {
  return !("totalSeasons" in item);
}

/** Fisher-Yates shuffle — returns a new array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function HeroCarousel({ items, userId }: HeroCarouselProps) {
  // Shuffle once on mount — filter out items with no usable image first
  const shuffled = useMemo(
    () => shuffle(items.filter((item) => !!(item.trailerPoster || item.poster))),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-advance every 6 seconds
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
  const movie = isMovie(current);
  const link = movie ? `/movies/${current.slug}` : `/series/${(current as Series).slug}`;
  const poster = (current.trailerPoster || current.poster || "").trim();

  return (
    <div className="relative h-[85vh] mt-12 w-full overflow-hidden">
      {/* Background — fades between items */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={poster}
          alt={current.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div
        className={`relative h-full flex items-center transition-opacity duration-500 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="container mx-auto px-4 md:px-12 lg:px-24">
          <div className="max-w-2xl space-y-6">
            {/* Type badge */}
            <Badge variant="outline" className="w-fit">
              {movie ? (
                <><Film className="w-4 h-4 mr-2" />Movie</>
              ) : (
                <><Tv className="w-4 h-4 mr-2" />TV Series</>
              )}
            </Badge>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
              {current.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-lg">{current.rating.toFixed(1)}</span>
              </div>
              <span className="text-lg">{current.year.value}</span>
              <span className="text-lg">{current.genre.name}</span>
              {!movie && (
                <span className="text-lg">
                  {(current as Series).totalSeasons} Season
                  {(current as Series).totalSeasons !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-lg text-white/90 line-clamp-3 leading-relaxed">
              {current.description}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8"
                asChild
              >
                <Link href={link}>
                  <Play className="w-5 h-5 mr-2 fill-white" />
                  {current.isComingSoon ? "View Details" : "Watch Now"}
                </Link>
              </Button>
              <AddToListButton
                itemId={current.id}
                type={movie ? "movie" : "series"}
                userId={userId || undefined}
                variant="secondary"
                size="icon"
                showText={false}
                className="h-10 w-10 rounded-full bg-gray-800/80 hover:bg-gray-700 border-0 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-12 h-12"
        onClick={() => { prev(); resetInterval(); }}
      >
        <ChevronLeft className="w-8 h-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-12 h-12"
        onClick={() => { next(); resetInterval(); }}
      >
        <ChevronRight className="w-8 h-8" />
      </Button>

      {/* Progress dots — show up to 10 to avoid clutter */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {shuffled.slice(0, 10).map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); resetInterval(); }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIndex ? "bg-orange-500 w-8" : "bg-white/40 w-2 hover:bg-white/70"
            }`}
          />
        ))}
        {shuffled.length > 10 && (
          <span className="text-white/40 text-xs self-center ml-1">
            {currentIndex + 1}/{shuffled.length}
          </span>
        )}
      </div>
    </div>
  );
}