import { getDiscoverySection } from "@/actions/movies-discovery";
import { ViewAllHeader } from "../components/view-all-header";
import { DiscoverInfiniteGrid } from "../components/discover-infinite-grid";

export const dynamic = "force-dynamic";

export default async function DramaPage() {
  const result = await getDiscoverySection("genre", { page: 1, limit: 18, genre: "Drama" });

  return (
    <div className="min-h-screen bg-background px-4 md:px-8 lg:px-12 py-8">
      <ViewAllHeader title="Drama" icon="🎭" total={result.total} />
      <DiscoverInfiniteGrid
        section="genre"
        genre="Drama"
        initialMovies={result.data}
        initialPage={1}
        totalPages={result.totalPages}
        limit={18}
        cols={6}
        emptyMessage="No drama movies found"
      />
    </div>
  );
}
