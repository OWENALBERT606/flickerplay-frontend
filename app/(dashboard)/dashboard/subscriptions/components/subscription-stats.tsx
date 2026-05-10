"use client";

import { Card } from "@/components/ui/card";
import { DollarSign, CheckCircle, XCircle, Clock, TrendingUp, AlertCircle } from "lucide-react";

interface SubscriptionStatsProps {
  stats: {
    totalRevenue: number;
    monthlyRevenue: number;
    activeCount: number;
    expiredCount: number;
    cancelledCount: number;
    pendingCount: number;
    revenueGrowth: number;
    activeGrowth: number;
  };
}

export function SubscriptionStats({ stats }: SubscriptionStatsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: `${stats.totalRevenue.toLocaleString()} UGX`,
      sub: `${stats.revenueGrowth >= 0 ? "+" : ""}${stats.revenueGrowth}% vs last month`,
      positive: stats.revenueGrowth >= 0,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Monthly Revenue",
      value: `${stats.monthlyRevenue.toLocaleString()} UGX`,
      sub: "This month",
      positive: true,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Active",
      value: stats.activeCount.toLocaleString(),
      sub: `${stats.activeGrowth >= 0 ? "+" : ""}${stats.activeGrowth}% vs last month`,
      positive: stats.activeGrowth >= 0,
      icon: CheckCircle,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Expired",
      value: stats.expiredCount.toLocaleString(),
      sub: "Needs renewal",
      positive: false,
      icon: AlertCircle,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Cancelled",
      value: stats.cancelledCount.toLocaleString(),
      sub: "Churned subscribers",
      positive: false,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      title: "Pending",
      value: stats.pendingCount.toLocaleString(),
      sub: "Awaiting payment",
      positive: null,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{card.value}</p>
            {card.positive !== null ? (
              <p className={`text-xs ${card.positive ? "text-green-500" : "text-red-500"}`}>
                {card.sub}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{card.sub}</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
