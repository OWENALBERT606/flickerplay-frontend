import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSeriesBySlug, getNextEpisode, getPreviousEpisode } from "@/actions/series";
import { getSession } from "@/actions/auth";
import { SubscriptionPaywall } from "@/components/front-end/subscription-paywall";
import { LoadingPlayer } from "../../components/loading-player";
import { EpisodePlayer } from "../../components/episode-player";
import { EpisodeInfo } from "../../components/episode-info";
import { EpisodesList } from "../../components/episodes-list";
import { getUserSubscriptionStatus } from "@/actions/subscription";
import { getWatchProgress } from "@/actions/watchHistory";

export default async function WatchEpisodePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}) {
  const { slug } = await params;
  const { season: seasonParam, episode: episodeParam } = await searchParams;

  const session = await getSession();
  const user = session?.user;

  const seriesData = await getSeriesBySlug(slug);

  if (!seriesData.success || !seriesData.data) {
    notFound();
  }

  const series = seriesData.data;
  const seasonNumber = seasonParam ? parseInt(seasonParam) : 1;
  const episodeNumber = episodeParam ? parseInt(episodeParam) : 1;
  const season = series.seasons?.find((s: any) => s.seasonNumber === seasonNumber);

  if (!season) {
    notFound();
  }

  const episode = season.episodes?.find(
    (e: any) => e.episodeNumber === episodeNumber
  );

  if (!episode) {
    notFound();
  }

  // Determine ad status and initial progress
  let showAds = true;
  let initialProgress = 0;
  let userId = "guest";

  if (user) {
    userId = user.id;
    const [subscriptionStatus, progressData] = await Promise.all([
      getUserSubscriptionStatus(user.id),
      getWatchProgress(user.id, episode.id, "episode"),
    ]);
    showAds = !subscriptionStatus.isSubscribed;
    initialProgress = progressData?.data?.progressPercent ?? 0;
  }

  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={<LoadingPlayer />}>
        <EpisodePlayer 
          episode={episode} 
          series={series} 
          season={season} 
          userId={userId}
          showAds={showAds}
          initialProgress={initialProgress}
        />
      </Suspense>

      <div className="container mx-auto px-4 md:px-12 lg:px-24 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EpisodeInfo episode={episode} series={series} season={season} />
          </div>
          <div>
            <EpisodesList
              series={series}
              currentSeason={season}
              currentEpisode={episode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
