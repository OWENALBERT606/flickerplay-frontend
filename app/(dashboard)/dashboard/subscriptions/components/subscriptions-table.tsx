"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface Subscription {
  id: string;
  user: { name?: string; email: string; firstName?: string; lastName?: string };
  plan: string;
  status: string;
  amount: number;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  autoRenew: boolean;
}

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  totalPages: number;
  currentPage: number;
  currentStatus: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  ACTIVE:    { label: "Active",    color: "bg-green-500",  icon: CheckCircle },
  EXPIRED:   { label: "Expired",   color: "bg-orange-500", icon: AlertCircle },
  CANCELLED: { label: "Cancelled", color: "bg-red-500",    icon: XCircle },
  PENDING:   { label: "Pending",   color: "bg-yellow-500", icon: Clock },
  FAILED:    { label: "Failed",    color: "bg-red-700",    icon: XCircle },
};

function daysRemaining(endDate: string | null) {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
  return diff;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" });
}

export function SubscriptionsTable({
  subscriptions,
  totalPages,
  currentPage,
  currentStatus,
}: SubscriptionsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      p.set(key, value);
    } else {
      p.delete(key);
    }
    p.set("page", "1");
    router.push(`?${p.toString()}`);
  };

  const goPage = (page: number) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(page));
    router.push(`?${p.toString()}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle>All Subscriptions</CardTitle>
        <div className="flex items-center gap-3">
          <Select value={currentStatus || "all"} onValueChange={(v) => setFilter("status", v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Started</th>
                <th className="pb-3 font-medium">Expires</th>
                <th className="pb-3 font-medium">Days Left</th>
                <th className="pb-3 font-medium">Auto Renew</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.length > 0 ? (
                subscriptions.map((sub) => {
                  const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.PENDING;
                  const StatusIcon = cfg.icon;
                  const days = daysRemaining(sub.endDate);
                  const userName =
                    sub.user?.name ||
                    [sub.user?.firstName, sub.user?.lastName].filter(Boolean).join(" ") ||
                    sub.user?.email;

                  return (
                    <tr key={sub.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium">{userName}</p>
                          <p className="text-xs text-muted-foreground">{sub.user?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="capitalize">
                          {sub.plan?.replace("_", " ").toLowerCase() ?? "Monthly"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon className="w-3.5 h-3.5" style={{ color: cfg.color.replace("bg-", "").includes("green") ? "#22c55e" : cfg.color.includes("orange") ? "#f97316" : cfg.color.includes("yellow") ? "#eab308" : "#ef4444" }} />
                          <Badge className={`${cfg.color} text-white border-0 text-xs`}>
                            {cfg.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold">
                        {sub.amount.toLocaleString()} {sub.currency ?? "UGX"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{formatDate(sub.startDate)}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{formatDate(sub.endDate)}</td>
                      <td className="py-3 pr-4">
                        {days === null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : days > 0 ? (
                          <span className={days <= 3 ? "text-red-500 font-semibold" : days <= 7 ? "text-yellow-500" : "text-green-500"}>
                            {days}d
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Ended</span>
                        )}
                      </td>
                      <td className="py-3">
                        <Badge variant={sub.autoRenew ? "default" : "outline"} className="text-xs">
                          {sub.autoRenew ? "On" : "Off"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
