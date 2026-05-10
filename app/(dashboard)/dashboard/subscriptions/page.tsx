import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { getAllSubscriptions } from "@/actions/admin";
import { SubscriptionStats } from "./components/subscription-stats";
import { SubscriptionRevenueChart } from "./components/subscription-revenue-chart";
import { SubscriptionsTable } from "./components/subscriptions-table";

export const dynamic = "force-dynamic";

interface SubscriptionsPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    plan?: string;
  }>;
}

export default async function SubscriptionsPage({ searchParams }: SubscriptionsPageProps) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?redirect=/dashboard/subscriptions");
  }

  const isAdmin = ["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(session.user.role);
  if (!isAdmin) redirect("/account");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const status = params.status || "";
  const plan = params.plan || "";

  const result = await getAllSubscriptions({ page, status, plan, limit: 25 });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">
          Track active plans, revenue, and subscriber lifecycle
        </p>
      </div>

      {/* Stat cards */}
      <SubscriptionStats stats={result.stats} />

      {/* Charts */}
      <SubscriptionRevenueChart
        revenueByMonth={result.revenueByMonth}
        statusBreakdown={result.statusBreakdown}
      />

      {/* Full table */}
      <SubscriptionsTable
        subscriptions={result.data}
        totalPages={result.totalPages}
        currentPage={page}
        currentStatus={status}
      />
    </div>
  );
}
