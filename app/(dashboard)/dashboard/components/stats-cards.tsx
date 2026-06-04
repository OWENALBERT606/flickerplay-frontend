"use client";

import { Card } from "@/components/ui/card";
import {
  Users, DollarSign, Film, Tv, TrendingUp, Download,
  Eye, CreditCard, Flame, Clock, Clapperboard, PlayCircle,
} from "lucide-react";

interface StatsCardsProps {
  stats: any;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const fmt = (n: any) => Number(n || 0).toLocaleString();

  const cards = [
    {
      title: "Total Revenue",
      value: `${fmt(stats?.totalRevenue)} UGX`,
      sub: `${fmt(stats?.monthlyRevenue)} UGX this month`,
      change: stats?.revenueGrowth ?? 0,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Active Users",
      value: fmt(stats?.activeUsers),
      sub: `${fmt(stats?.totalUsers)} total registered`,
      change: stats?.userGrowth ?? 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Subscriptions",
      value: fmt(stats?.activeSubscriptions),
      sub: "currently active",
      change: stats?.subscriptionGrowth ?? 0,
      icon: CreditCard,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Total Movies",
      value: fmt(stats?.totalMovies),
      sub: `+${fmt(stats?.moviesAdded)} this month`,
      change: null,
      icon: Film,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      badges: [
        { label: `${fmt(stats?.trendingMovies)} trending`, icon: Flame, color: "text-red-400" },
        { label: `${fmt(stats?.comingSoonMovies)} coming soon`, icon: Clock, color: "text-yellow-400" },
      ],
    },
    {
      title: "TV Series",
      value: fmt(stats?.totalSeries),
      sub: `${fmt(stats?.totalEpisodes)} total episodes · +${fmt(stats?.seriesAdded)} this month`,
      change: null,
      icon: Tv,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      title: "Total Views",
      value: fmt(stats?.totalViews),
      sub: "across movies & series",
      change: stats?.viewsGrowth ?? 0,
      icon: Eye,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Downloads",
      value: fmt(stats?.totalDownloads),
      sub: "all-time download events",
      change: stats?.downloadsGrowth ?? 0,
      icon: Download,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      title: "Monthly Revenue",
      value: `${fmt(stats?.monthlyRevenue)} UGX`,
      sub: "current month so far",
      change: stats?.monthlyRevenueGrowth ?? 0,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const isPositive = (card.change ?? 0) >= 0;

        return (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold leading-none mb-1">{card.value}</p>
                <p className="text-xs text-muted-foreground truncate">{card.sub}</p>

                {card.badges && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {card.badges.map((b, bi) => {
                      const BIcon = b.icon;
                      return (
                        <span key={bi} className={`flex items-center gap-1 text-[10px] font-medium ${b.color}`}>
                          <BIcon className="w-3 h-3" />
                          {b.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {card.change !== null && (
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp
                      className={`w-3.5 h-3.5 ${isPositive ? "text-green-500" : "text-red-500 rotate-180"}`}
                    />
                    <span className={`text-xs font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                      {isPositive ? "+" : ""}{card.change}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">vs last month</span>
                  </div>
                )}
              </div>

              <div className={`${card.bg} ${card.color} p-2.5 rounded-lg shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
