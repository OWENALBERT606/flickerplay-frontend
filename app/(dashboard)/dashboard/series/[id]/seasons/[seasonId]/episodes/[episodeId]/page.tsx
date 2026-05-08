import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Eye, Calendar } from "lucide-react";
import { getEpisode } from "@/actions/series";
import Image from "next/image";
import { DeleteEpisodeButton } from "@/app/(dashboard)/dashboard/series/components/delete-episode-button";

export default async function EpisodeDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; seasonId: string; episodeId: string }> 
}) {
  const { id, seasonId, episodeId } = await params;
  const episodeData = await getEpisode(episodeId);

  if (!episodeData.success || !episodeData.data) {
    notFound();
  }

  const episode = episodeData.data;
  const viewsCount = Number(episode.viewsCount || 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/dashboard/series/${id}/seasons/${seasonId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Season
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Episode {episode.episodeNumber}: {episode.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            {episode.length && <span>{episode.length}</span>}
            {episode.size && <span>{episode.size}</span>}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {viewsCount.toLocaleString()} views
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/series/${id}/seasons/${seasonId}/episodes/${episodeId}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteEpisodeButton 
            episode={episode} 
            seriesId={id} 
            seasonId={seasonId} 
            variant="outline" 
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thumbnail */}
        {episode.poster && (
          <Card>
            <CardContent className="p-4">
              <div className="relative aspect-video w-full">
                <Image
                  src={episode.poster}
                  alt={episode.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Details */}
        <div className={episode.poster ? "md:col-span-2" : "md:col-span-3"}>
          {/* Description */}
          {episode.description && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {episode.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle>Episode Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Episode Number</div>
                  <div className="text-muted-foreground">{episode.episodeNumber}</div>
                </div>

                {episode.length && (
                  <div>
                    <div className="text-sm font-medium mb-1">Duration</div>
                    <div className="text-muted-foreground">{episode.length}</div>
                  </div>
                )}

                {episode.size && (
                  <div>
                    <div className="text-sm font-medium mb-1">File Size</div>
                    <div className="text-muted-foreground">{episode.size}</div>
                  </div>
                )}

                {episode.releaseDate && (
                  <div>
                    <div className="text-sm font-medium mb-1">Release Date</div>
                    <div className="text-muted-foreground">
                      {new Date(episode.releaseDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              {episode.videoUrl ? (
                <div>
                  <div className="text-sm font-medium mb-2">Video URL</div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {episode.videoUrl.substring(0, 60)}...
                  </Badge>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-medium mb-2">Video URL</div>
                  <Badge variant="outline" className="text-orange-500 border-orange-500">
                    No video uploaded yet
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}