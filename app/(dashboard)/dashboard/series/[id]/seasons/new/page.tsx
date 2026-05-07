import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { getSeries } from "@/actions/series";
import { SeasonForm } from "../../../components/season-form";

export default async function NewSeasonPage({ 
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/dashboard/series/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {series.title}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add Season</CardTitle>
          <CardDescription>
            Add a new season to {series.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeasonForm
            seriesId={id}
            seriesTitle={series.title}
            seriesPoster={series.poster}
            seriesTrailerPoster={series.trailerPoster}
          />
        </CardContent>
      </Card>
    </div>
  );
}