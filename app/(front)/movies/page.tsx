import { Suspense } from "react";
import { getSession } from "@/actions/auth";
import {
  getDiscoverySection,
  getContinueWatchingSection,
  getRecommendedSection,
} from "@/actions/movies-discovery";
import { MovieSection } from "./components/movie-section";
import { SectionSkeleton } from "./components/section-skeleton";

export const dynamic = "force-dynamic";

async function ContinueWatchingSection({ userId }: { userId: string }) {
  const result = await getContinueWatchingSection(userId, { limit: 18 });
  if (!result.success || result.data.length === 0) return null;
  return (
    <MovieSection
      title="Continue Watching"
      icon="▶️"
      movies={result.data}
      viewAllHref="/movies/continue-watching"
      cols={6}
    />
  );
}

async function RecommendedSection({ userId }: { userId: string }) {
  const result = await getRecommendedSection(userId, { limit: 18 });
  if (!result.success || result.data.length === 0) return null;
  return (
    <MovieSection
      title="Recommended For You"
      icon="✨"
      movies={result.data}
      viewAllHref="/movies/recommended"
      cols={6}
    />
  );
}

export default async function MoviesPage() {
  const session = await getSession();
  const userId  = session?.user?.id;

  const [newly, trending, topRated, recent, action, comedy, drama] = await Promise.allSettled([
    getDiscoverySection("new",       { limit: 18 }),
    getDiscoverySection("trending",  { limit: 18 }),
    getDiscoverySection("top-rated", { limit: 18 }),
    getDiscoverySection("recent",    { limit: 18 }),
    getDiscoverySection("genre",     { limit: 18, genre: "Action" }),
    getDiscoverySection("genre",     { limit: 18, genre: "Comedy" }),
    getDiscoverySection("genre",     { limit: 18, genre: "Drama" }),
  ]);

  const s = <T,>(r: PromiseSettledResult<T>, fallback: T) =>
    r.status === "fulfilled" ? r.value : fallback;

  const empty = { data: [], total: 0, page: 1, totalPages: 1, success: false };

  const newlyData   = s(newly,   empty);
  const trendData   = s(trending, empty);
  const topData     = s(topRated, empty);
  const recentData  = s(recent,   empty);
  const actionData  = s(action,   empty);
  const comedyData  = s(comedy,   empty);
  const dramaData   = s(drama,    empty);

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 md:px-8 lg:px-12 pb-16 space-y-10 pt-6">

        {/* ── Personalized (requires auth, loaded separately for SSR isolation) ── */}
        {userId && (
          <>
            <Suspense fallback={<SectionSkeleton count={6} />}>
              <ContinueWatchingSection userId={userId} />
            </Suspense>
            <Suspense fallback={<SectionSkeleton count={6} />}>
              <RecommendedSection userId={userId} />
            </Suspense>
          </>
        )}

        {/* ── Static sections ── */}
        <MovieSection
          title="Newly Added"
          icon="🆕"
          movies={newlyData.data}
          viewAllHref="/movies/new"
          cols={6}
        />

        <MovieSection
          title="Trending Now"
          icon="🔥"
          movies={trendData.data}
          viewAllHref="/movies/trending"
          cols={6}
        />

        <MovieSection
          title="Top Rated"
          icon="⭐"
          movies={topData.data}
          viewAllHref="/movies/top-rated"
          cols={6}
        />

        <MovieSection
          title="Recently Released"
          icon="🎬"
          movies={recentData.data}
          viewAllHref="/movies/recent-releases"
          cols={6}
        />

        <MovieSection
          title="Action"
          icon="💥"
          movies={actionData.data}
          viewAllHref="/movies/action"
          cols={6}
        />

        <MovieSection
          title="Comedy"
          icon="😂"
          movies={comedyData.data}
          viewAllHref="/movies/comedy"
          cols={6}
        />

        <MovieSection
          title="Drama"
          icon="🎭"
          movies={dramaData.data}
          viewAllHref="/movies/drama"
          cols={6}
        />
      </main>
    </div>
  );
}
