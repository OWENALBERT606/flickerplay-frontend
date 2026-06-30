import { redirect } from "next/navigation";
import { getSession } from "@/actions/auth";
import { getContinueWatchingSection } from "@/actions/movies-discovery";
import { ViewAllHeader } from "../components/view-all-header";
import { DiscoverInfiniteGrid } from "../components/discover-infinite-grid";

export const dynamic = "force-dynamic";

export default async function ContinueWatchingPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const result = await getContinueWatchingSection(userId, { page: 1, limit: 18 });

  return (
    <div className="min-h-screen bg-background px-4 md:px-8 lg:px-12 py-8">
      <ViewAllHeader title="Continue Watching" icon="▶️" total={result.total} />
      <DiscoverInfiniteGrid
        section="continue-watching"
        userId={userId}
        initialMovies={result.data}
        initialPage={1}
        totalPages={result.totalPages}
        limit={18}
        cols={9}
        emptyMessage="Nothing in progress yet — start watching a movie!"
      />
    </div>
  );
}
