import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Eye, Calendar, Clock } from "lucide-react";

interface EpisodeInfoProps {
  episode: any;
  series: any;
  season: any;
}

export function EpisodeInfo({ episode, series, season }: EpisodeInfoProps) {
  const viewsCount = Number(episode.viewsCount || 0);

  return (
    <div className="space-y-6">
      {/* Episode Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline">
            Season {season.seasonNumber} • Episode {episode.episodeNumber}
          </Badge>
          <Badge variant="outline">{series.genre.name}</Badge>
        </div>

        <h1 className="text-3xl font-bold mb-2">{episode.title}</h1>

        <div className="flex items-center gap-4 text-muted-foreground">
          {episode.length && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{episode.length}</span>
            </div>
          )}

          {viewsCount > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{viewsCount.toLocaleString()} views</span>
            </div>
          )}

          {episode.releaseDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date(episode.releaseDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Episode Description */}
      {episode.description && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-3">Episode Synopsis</h2>
            <p className="text-muted-foreground leading-relaxed">
              {episode.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Series Info */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">About {series.title}</h2>

          <div className="flex items-start gap-4">
            <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={series.poster}
                alt={series.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{series.rating.toFixed(1)}</span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3">
                {series.description}
              </p>

              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={series.vj.avatarUrl}
                    alt={series.vj.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {series.vj.name}
                </span>
              </div>

              {series.director && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Director:</span> {series.director}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}