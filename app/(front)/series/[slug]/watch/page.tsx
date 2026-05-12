import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSeriesBySlug, getNextEpisode, getPreviousEpisode } from "@/actions/series";
import { getSession } from "@/actions/auth";
import { SubscriptionPaywall } from "@/components/front-end/subscription-paywall";
import { LoadingPlayer } from "../../components/loading-player";
import { EpisodePlayer } from "../../components/episode-player";
import { EpisodeInfo } from "../../components/episode-info";
import { EpisodesList } from "../../components/episodes-list";

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

  // Guest: must log in
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <SubscriptionPaywall type="movie-guest" />
      </div>
    );
  }

  const seriesData = await getSeriesBySlug(slug);

  if (!seriesData.success || !seriesData.data) {
    notFound();
  }

  const series = seriesData.data;

  const seasonNumber = seasonParam ? parseInt(seasonParam) : 1;
  const episodeNumber = episodeParam ? parseInt(episodeParam) : 1;

  const season = series.seasons?.find((s) => s.seasonNumber === seasonNumber);

  if (!season) {
    notFound();
  }

  const episode = season.episodes?.find(
    (e) => e.episodeNumber === episodeNumber
  );

  if (!episode) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={<LoadingPlayer />}>
        <EpisodePlayer episode={episode} series={series} season={season} />
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
