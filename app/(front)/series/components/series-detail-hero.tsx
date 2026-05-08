"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Share2, Star, Eye, Calendar, VolumeX, Volume2 } from "lucide-react";
import type { Series } from "@/actions/series";

interface SeriesDetailHeroProps {
  series: Series;
  slug: string;
  viewsCount: number;
  /** First available episode videoUrl — plays muted in background */
  previewVideoUrl?: string;
}

export function SeriesDetailHero({
  series,
  slug,
  viewsCount,
  previewVideoUrl,
}: SeriesDetailHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !previewVideoUrl) return;
    v.muted = true;
    v.play().catch(() => {});
  }, [previewVideoUrl]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div className="relative h-[85vh] w-full overflow-hidden">
      {/* ── Background layer ── */}
      <div className="absolute inset-0">
        {/* Poster — shown until video fades in */}
        <Image
          src={series.trailerPoster || series.poster}
          alt={series.title}
          fill
          priority
          className={`object-cover transition-opacity duration-1000 ${
            videoReady ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Background video */}
        {previewVideoUrl && (
          <video
            ref={videoRef}
            src={previewVideoUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setVideoReady(true)}
          />
        )}

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      {/* ── Mute / unmute button ── */}
      {previewVideoUrl && videoReady && (
        <button
          onClick={toggleMute}
          className="absolute bottom-28 right-8 z-20 w-10 h-10 rounded-full border-2 border-white/50
            hover:border-white flex items-center justify-center text-white/70 hover:text-white
            bg-black/40 backdrop-blur-sm transition-colors"
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}

      {/* ── Foreground content ── */}
      <div className="relative h-full flex items-end z-10">
        <div className="container mx-auto px-4 md:px-12 lg:px-24 pb-14">
          <div className="max-w-2xl space-y-4">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {series.isTrending && <Badge className="bg-red-600">🔥 Trending</Badge>}
              {series.isComingSoon && <Badge className="bg-blue-600">Coming Soon</Badge>}
              <Badge variant="outline">{series.genre.name}</Badge>
              <Badge variant="outline">{series.year.value}</Badge>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
              {series.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{series.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{viewsCount.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {series.totalSeasons} Season{series.totalSeasons !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-lg text-white/90 line-clamp-3">{series.description}</p>

            {/* Buttons */}
            <div className="flex items-center gap-4 pt-4">
              {!series.isComingSoon && series.seasons && series.seasons.length > 0 && (
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  asChild
                >
                  <Link href={`/series/${slug}/watch`}>
                    <Play className="w-5 h-5 mr-2 fill-white" />
                    Start Watching
                  </Link>
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Plus className="w-5 h-5 mr-2" />
                My List
              </Button>
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
