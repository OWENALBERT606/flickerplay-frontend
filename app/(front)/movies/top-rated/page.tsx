import { getDiscoverySection } from "@/actions/movies-discovery";
import { ViewAllHeader } from "../components/view-all-header";
import { DiscoverInfiniteGrid } from "../components/discover-infinite-grid";

export const dynamic = "force-dynamic";

export default async function TopRatedPage() {
  const result = await getDiscoverySection("top-rated", { page: 1, limit: 18 });

  return (
    <div className="min-h-screen bg-background px-4 md:px-8 lg:px-12 py-8">
      <ViewAllHeader title="Top Rated" icon="⭐" total={result.total} />
      <DiscoverInfiniteGrid
        section="top-rated"
        initialMovies={result.data}
        initialPage={1}
        totalPages={result.totalPages}
        limit={18}
        cols={6}
        emptyMessage="No top rated movies found"
      />
    </div>
  );
}
