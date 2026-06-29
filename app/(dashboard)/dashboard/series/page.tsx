import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { listSeries } from "@/actions/series";
import SeriesListing from "./components/series-listing";

export default async function SeriesPage() {
  const seriesData = await listSeries({ limit: 1000 });
  const series = seriesData.data || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">TV Series</h1>
          <p className="text-muted-foreground mt-2">
            Manage your series collection
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/series/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Series
          </Link>
        </Button>
      </div>

      <SeriesListing series={series} />
    </div>
  );
}