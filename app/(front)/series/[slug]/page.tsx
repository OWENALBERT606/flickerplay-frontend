import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { getSeriesBySlug, incrementSeriesViews } from "@/actions/series";
import { getSession } from "@/actions/auth";
import { TrailerPlayer } from "@/components/front-end/trailer-player";
import { SeriesDetailHero } from "../components/series-detail-hero";

export default async function SeriesDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const seriesData = await getSeriesBySlug(slug);
  const session = await getSession();
  const user = session?.user;
    

  if (!seriesData.success || !seriesData.data) {
    notFound();
  }

  const series = seriesData.data;
  const viewsCount = Number(series.viewsCount || 0);

  // Increment view count (fire and forget)
  incrementSeriesViews(series.id).catch(console.error);

  // First episode that has a video — used as muted background preview
  const previewVideoUrl = (series.seasons ?? [])
    .flatMap((s: any) => s.episodes ?? [])
    .find((e: any) => e.videoUrl)?.videoUrl as string | undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — plays first episode video muted in background */}
      <SeriesDetailHero
        series={series}
        slug={slug}
        viewsCount={viewsCount}
        previewVideoUrl={previewVideoUrl}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-12 lg:px-24 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
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
                      const videoEpisodeCount = (season.episodes || []).filter((e: any) => e.videoUrl).length;
                      return (
                        <Link
                          key={season.id}
                          href={`/series/${slug}/season/${season.seasonNumber}`}
                        >
                          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-4">
                                {season.poster && (
                                  <div className="relative w-24 h-36 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                      src={season.poster}
                                      alt={`Season ${season.seasonNumber}`}
                                      fill
                                      className="object-cover"
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
                                    <span>{videoEpisodeCount} Episode{videoEpisodeCount !== 1 ? "s" : ""}</span>
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
                <p className="text-muted-foreground leading-relaxed">
                  {series.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Poster */}
            <Card>
              <CardContent className="p-4">
                <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden">
                  <Image
                    src={series.poster}
                    alt={series.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    VJ
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={series.vj.avatarUrl}
                        alt={series.vj.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium">{series.vj.name}</span>
                  </div>
                </div>

                {series.director && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Director
                    </div>
                    <div className="font-medium">{series.director}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Genre
                  </div>
                  <Badge variant="outline">{series.genre.name}</Badge>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Year
                  </div>
                  <div className="font-medium">{series.year.value}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Seasons
                  </div>
                  <div className="font-medium">{series.totalSeasons}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Total Episodes
                  </div>
                  <div className="font-medium">{series.totalEpisodes}</div>
                </div>

                {series.cast && series.cast.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Cast
                    </div>
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
      </div>
    </div>
  );
}