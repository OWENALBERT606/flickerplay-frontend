import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Star } from "lucide-react";
import { incrementSeriesViews } from "@/actions/series";
import { getCachedSeriesBySlug, getCachedListSeries } from "@/lib/cache";
import { getSession } from "@/actions/auth";
import { SeriesDetailHero } from "../components/series-detail-hero";
import { TrailerPlayer } from "@/components/front-end/trailer-player";
import { CommentSection } from "@/components/front-end/comment-section";
import { cleanTitle } from "@/lib/utils";

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [seriesData, session] = await Promise.all([
    getCachedSeriesBySlug(slug),
    getSession(),
  ]);
  const user = session?.user;

  if (!seriesData.success || !seriesData.data) {
    notFound();
  }

  const series = seriesData.data;
  const viewsCount = Number(series.viewsCount || 0);

  // Increment view count (fire and forget)
  incrementSeriesViews(series.id).catch(console.error);

  // Related series — same genre, exclude current
  const relatedData = await getCachedListSeries({ genreId: series.genreId, limit: 7 });
  const relatedSeries = (relatedData.data ?? []).filter((s) => s.id !== series.id).slice(0, 6);

  // First episode with a video — used as muted background preview
  const previewVideoUrl = (series.seasons ?? [])
    .flatMap((s: any) => s.episodes ?? [])
    .find((e: any) => e.videoUrl)?.videoUrl as string | undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <SeriesDetailHero
        series={series}
        slug={slug}
        viewsCount={viewsCount}
        previewVideoUrl={previewVideoUrl}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-12 lg:px-24 py-12">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Column ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Seasons */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Seasons</h2>
              {(() => {
                const seasonsWithVideo = (series.seasons || []).filter(
                  (s: any) => (s.episodes || []).some((e: any) => e.videoUrl)
                );
                return seasonsWithVideo.length > 0 ? (
                  <div className="space-y-4">
                    {seasonsWithVideo.map((season: any) => {
                      const videoEpisodeCount = (season.episodes || []).filter(
                        (e: any) => e.videoUrl
                      ).length;
                      return (
                        <Link key={season.id} href={`/series/${slug}/season/${season.seasonNumber}`}>
                          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-4">
                                {season.poster && (
                                  <div className="w-24 h-36 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                      src={season.poster}
                                      alt={`Season ${season.seasonNumber}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold mb-2">
                                    Season {season.seasonNumber}
                                    {season.title && `: ${season.title}`}
                                  </h3>
                                  {season.description && (
                                    <p className="text-muted-foreground line-clamp-2 mb-2">
                                      {season.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>
                                      {videoEpisodeCount} Episode{videoEpisodeCount !== 1 ? "s" : ""}
                                    </span>
                                    {season.releaseYear && <span>{season.releaseYear}</span>}
                                  </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">
                        {series.isComingSoon
                          ? "Episodes will be available when the series is released."
                          : "No seasons available yet."}
                      </p>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>

            {/* Trailer */}
            {series.trailerUrl && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Trailer</h2>
                <TrailerPlayer
                  url={series.trailerUrl}
                  title={`${series.title} Trailer`}
                  poster={series.trailerPoster || series.poster}
                />
              </div>
            )}

            {/* About */}
            <div>
              <h2 className="text-2xl font-bold mb-6">About</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">{series.description}</p>
              </div>
            </div>

            {/* Comments */}
            <CommentSection
              itemId={series.id}
              type="series"
              userId={user?.id}
              userName={user?.name}
              userImage={user?.imageUrl}
            />
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Poster */}
            <Card>
              <CardContent className="p-4">
                <div className="aspect-[2/3] w-full rounded-lg overflow-hidden">
                  <img
                    src={series.poster}
                    alt={series.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">VJ</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src={series.vj.avatarUrl}
                        alt={series.vj.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium">{series.vj.name}</span>
                  </div>
                </div>

                {series.director && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Director</div>
                    <div className="font-medium">{series.director}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Genre</div>
                  <Badge variant="outline">{series.genre.name}</Badge>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Year</div>
                  <div className="font-medium">{series.year.value}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Seasons</div>
                  <div className="font-medium">{series.totalSeasons}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Episodes</div>
                  <div className="font-medium">{series.totalEpisodes}</div>
                </div>

                {series.cast && series.cast.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Cast</div>
                    <div className="flex flex-wrap gap-2">
                      {series.cast.map((actor, index) => (
                        <Badge key={index} variant="secondary">
                          {actor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Related Series (full width below grid) ── */}
        {relatedSeries.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">More Like This</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
              {relatedSeries.map((s) => (
                <Link key={s.id} href={`/series/${s.slug}`} className="group block">
                  <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden">
                    <Image
                      src={s.poster}
                      alt={s.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg" />
                    <div className="absolute top-2 right-2">
                      <span className="flex items-center gap-0.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        {s.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white font-semibold text-xs line-clamp-2 leading-tight">
                        {cleanTitle(s.title)}
                      </p>
                      <p className="text-white/60 text-[10px] mt-0.5">
                        {s.totalSeasons} Season{s.totalSeasons !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
