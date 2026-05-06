import { getSession } from "@/actions/auth";
import { getDashboardStats } from "@/actions/dashboard";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { StatsCards } from "./components/stats-cards";
import { RevenueChart } from "./components/revenue-chart";
import { UserGrowthChart } from "./components/user-growth-chart";
import { TopContent } from "./components/top-component";
import { RecentTransactions } from "./components/recent-transactions";
import { RecentUsers } from "./components/recent-users";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?redirect=/dashboard");
  }

  // Check if user is admin
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(session.user.role);
  
  if (!isAdmin) {
    redirect("/account");
  }

  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats.data} />

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RevenueChart data={stats.data?.revenueData} />
        <UserGrowthChart data={stats.data?.userGrowthData} />
      </div>

      {/* Content Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TopContent movies={stats.data?.topMovies} series={stats.data?.topSeries} />
        <RecentTransactions transactions={stats.data?.recentTransactions} />
      </div>

      {/* Recent Users */}
      <RecentUsers users={stats.data?.recentUsers} />
    </div>
  );
}