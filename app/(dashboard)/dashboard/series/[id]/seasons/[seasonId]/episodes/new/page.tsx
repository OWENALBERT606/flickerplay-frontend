import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { getSeason, getSeries } from "@/actions/series";
import { EpisodeForm } from "@/app/(dashboard)/dashboard/series/components/episode-form";

export default async function NewEpisodePage({ 
  params 
}: { 
  params: Promise<{ id: string; seasonId: string }> 
}) {
  const { id, seasonId } = await params;

  const [seasonData, seriesData] = await Promise.all([
    getSeason(seasonId),
    getSeries(id),
  ]);

  if (!seasonData.success || !seasonData.data) notFound();

  const season = seasonData.data;
  const series = seriesData.data;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/dashboard/series/${id}/seasons/${seasonId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Season {season.seasonNumber}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add Episode</CardTitle>
          <CardDescription>
            Add a new episode to Season {season.seasonNumber}
            {series?.title ? ` of ${series.title}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EpisodeForm
            seriesId={id}
            seasonId={seasonId}
            seasonNumber={season.seasonNumber}
            seriesPoster={series?.poster || series?.trailerPoster}
            seriesTitle={series?.title}
          />
        </CardContent>
      </Card>
    </div>
  );
}
