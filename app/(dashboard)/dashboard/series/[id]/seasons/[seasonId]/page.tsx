import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import { getSeason } from "@/actions/series";
import Image from "next/image";
import { DeleteSeasonButton } from "../../../components/delete-season-button";

export default async function SeasonDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; seasonId: string }> 
}) {
  const { id, seasonId } = await params;
  const seasonData = await getSeason(seasonId);

  if (!seasonData.success || !seasonData.data) {
    notFound();
  }

  const season = seasonData.data;

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/dashboard/series/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Series
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Season {season.seasonNumber}
            {season.title && `: ${season.title}`}
          </h1>
          <p className="text-muted-foreground">
            {season.seriesId || ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/series/${id}/seasons/${seasonId}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteSeasonButton season={season} seriesId={id} variant="outline" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{season.totalEpisodes}</div>
          </CardContent>
        </Card>

        {season.releaseYear && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Release Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{season.releaseYear}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Poster */}
        {season.poster && (
          <Card>
            <CardContent className="p-4">
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={season.poster}
                  alt={`Season ${season.seasonNumber}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Details */}
        <div className={season.poster ? "md:col-span-2" : "md:col-span-3"}>
          {/* Description */}
          {season.description && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {season.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Episodes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Episodes</CardTitle>
                <Button asChild size="sm">
                  <Link href={`/dashboard/series/${id}/seasons/${seasonId}/episodes/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Episode
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {season.episodes && season.episodes.length > 0 ? (
                <div className="space-y-2">
                  {season.episodes.map((episode) => (
                    <Link
                      key={episode.id}
                      href={`/dashboard/series/${id}/seasons/${seasonId}/episodes/${episode.id}`}
                    >
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          {episode.poster && (
                            <div className="relative w-24 h-16 rounded overflow-hidden">
                              <Image
                                src={episode.poster}
                                alt={episode.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              Episode {episode.episodeNumber}: {episode.title}
                              {!episode.videoUrl && (
                                <Badge variant="outline" className="text-orange-500 border-orange-500">
                                  No video
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {episode.length && <span>{episode.length}</span>}
                              {!episode.videoUrl && (
                                <span className="ml-2 text-orange-500">
                                  No video uploaded yet
                                </span>
                              )}
                              {episode.viewsCount && episode.videoUrl && (
                                <span className="ml-2">
                                  {Number(episode.viewsCount).toLocaleString()} views
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No episodes yet. Add your first episode to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}