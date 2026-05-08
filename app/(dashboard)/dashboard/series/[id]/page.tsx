import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Plus, Eye, Star } from "lucide-react";
import { getSeries } from "@/actions/series";
import Image from "next/image";
import { DeleteSeriesButton } from "../components/delete-series-button";
import { TmdbImportPanel } from "../components/tmdb-import-panel";

export default async function SeriesDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const seriesData = await getSeries(id);

  if (!seriesData.success || !seriesData.data) {
    notFound();
  }

  const series = seriesData.data;
  const viewsCount = Number(series.viewsCount || 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard/series">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Series
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">{series.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {series.rating.toFixed(1)}
            </span>
            <span>{series.year.value}</span>
            <span>{series.genre.name}</span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {viewsCount.toLocaleString()} views
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/series/${id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteSeriesButton series={series} variant="outline" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Seasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{series.totalSeasons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{series.totalEpisodes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {series.isTrending && <Badge>Trending</Badge>}
              {series.isComingSoon && <Badge variant="secondary">Coming Soon</Badge>}
              {!series.isTrending && !series.isComingSoon && (
                <Badge variant="outline">Active</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Poster */}
        <Card>
          <CardContent className="p-4">
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={series.poster}
                alt={series.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {series.description}
              </p>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-1">VJ</div>
                <div className="text-muted-foreground">{series.vj.name}</div>
              </div>

              {series.director && (
                <div>
                  <div className="text-sm font-medium mb-1">Director</div>
                  <div className="text-muted-foreground">{series.director}</div>
                </div>
              )}

              {series.cast && series.cast.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Cast</div>
                  <div className="flex flex-wrap gap-2">
                    {series.cast.map((actor, index) => (
                      <Badge key={index} variant="outline">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── TMDB Import Panel ── */}
          <TmdbImportPanel
            seriesId={id}
            seriesTitle={series.title}
            seriesPoster={series.poster}
          />

          {/* Seasons */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Seasons</CardTitle>
                <Button asChild size="sm">
                  <Link href={`/dashboard/series/${id}/seasons/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Season
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {series.seasons && series.seasons.length > 0 ? (
                <div className="space-y-2">
                  {series.seasons.map((season) => (
                    <Link
                      key={season.id}
                      href={`/dashboard/series/${id}/seasons/${season.id}`}
                    >
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                          <div className="font-medium">
                            Season {season.seasonNumber}
                            {season.title && `: ${season.title}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {season._count?.episodes || season.totalEpisodes} episodes
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
                  No seasons yet. Add your first season to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}