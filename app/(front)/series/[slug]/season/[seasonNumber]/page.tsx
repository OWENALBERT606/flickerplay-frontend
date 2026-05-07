import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Calendar, Clock, Eye } from "lucide-react";
import { getSeriesBySlug } from "@/actions/series";
import { TrailerPlayer } from "@/components/front-end/trailer-player";

export default async function SeasonDetailPage({
  params,
}: {
  params: Promise<{ slug: string; seasonNumber: string }>;
}) {
  const { slug, seasonNumber } = await params;
  const seriesData = await getSeriesBySlug(slug);

  if (!seriesData.success || !seriesData.data) {
    notFound();
  }

  const series = seriesData.data;
  const season = series.seasons?.find(
    (s) => s.seasonNumber === parseInt(seasonNumber)
  );

  if (!season) {
    notFound();
  }

  return (
    <div className="min-h-screen mt-24  bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 md:px-12 lg:px-24 py-6">
          <Link href={`/series/${slug}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {series.title}
            </Button>
          </Link>

          <div className="flex items-start gap-6">
            {season.poster && (
              <div className="relative w-32 h-48 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={season.poster}
                  alt={`Season ${season.seasonNumber}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline">{series.genre.name}</Badge>
                {season.releaseYear && (
                  <Badge variant="outline">{season.releaseYear}</Badge>
                )}
              </div>

              <h1 className="text-4xl font-bold mb-2">
                {series.title} - Season {season.seasonNumber}
              </h1>
              {season.title && (
                <p className="text-xl text-muted-foreground mb-3">
                  {season.title}
                </p>
              )}

              {season.description && (
                <p className="text-muted-foreground max-w-3xl">
                  {season.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span>{season.totalEpisodes} Episodes</span>
                <span>•</span>
                <span>VJ {series.vj.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div className="container mx-auto px-4 md:px-12 lg:px-24 py-8">
        <h2 className="text-2xl font-bold mb-6">Episodes</h2>

        {season.episodes && season.episodes.length > 0 ? (
          <div className="space-y-4">
            {season.episodes.map((episode) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                seriesSlug={slug}
                seasonNumber={season.seasonNumber}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No episodes available yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Season Trailer */}
      {season.trailerUrl && (
        <div className="container mx-auto px-4 md:px-12 lg:px-24 py-8 border-t border-border">
          <h2 className="text-2xl font-bold mb-6">Season Trailer</h2>
          <TrailerPlayer
            url={season.trailerUrl}
            title={`${series.title} Season ${season.seasonNumber} Trailer`}
            poster={season.poster || undefined}
            className="max-w-4xl"
          />
        </div>
      )}
    </div>
  );
}

interface EpisodeCardProps {
  episode: any;
  seriesSlug: string;
  seasonNumber: number;
}

function EpisodeCard({ episode, seriesSlug, seasonNumber }: EpisodeCardProps) {
  const viewsCount = Number(episode.viewsCount || 0);

  return (
    <Link
    className=""
      href={`/series/${seriesSlug}/watch?season=${seasonNumber}&episode=${episode.episodeNumber}`}
    >
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer group">
        <CardContent className="p-0">
          <div className="flex gap-4 p-4">
            {/* Episode Thumbnail */}
            <div className="relative w-48 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              {episode.poster ? (
                <Image
                  src={episode.poster}
                  alt={episode.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Play className="w-12 h-12 text-muted-foreground" />
                </div>
              )}

              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                </div>
              </div>

              {/* Episode Number Badge */}
              <div className="absolute top-2 left-2">
                <Badge className="bg-black/70 backdrop-blur-sm border-0">
                  Episode {episode.episodeNumber}
                </Badge>
              </div>
            </div>

            {/* Episode Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold mb-2 line-clamp-1">
                {episode.episodeNumber}. {episode.title}
              </h3>

              {episode.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {episode.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {episode.length && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{episode.length}</span>
                  </div>
                )}

                {viewsCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{viewsCount.toLocaleString()} views</span>
                  </div>
                )}

                {episode.releaseDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(episode.releaseDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {episode.size && <span>{episode.size}</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}