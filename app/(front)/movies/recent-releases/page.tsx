import { getDiscoverySection } from "@/actions/movies-discovery";
import { ViewAllHeader } from "../components/view-all-header";
import { DiscoverInfiniteGrid } from "../components/discover-infinite-grid";

export const dynamic = "force-dynamic";

export default async function RecentReleasesPage() {
  const result = await getDiscoverySection("recent", { page: 1, limit: 18 });

  return (
    <div className="min-h-screen bg-background px-4 md:px-8 lg:px-12 py-8">
      <ViewAllHeader title="Recently Released" icon="🎬" total={result.total} />
      <DiscoverInfiniteGrid
        section="recent"
        initialMovies={result.data}
        initialPage={1}
        totalPages={result.totalPages}
        limit={18}
        cols={6}
        emptyMessage="No recent releases found"
      />
    </div>
  );
}
