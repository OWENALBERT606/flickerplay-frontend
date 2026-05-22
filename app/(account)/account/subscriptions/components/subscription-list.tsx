"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { cancelSubscription } from "@/actions/payments";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  autoRenew: boolean;
  createdAt: string;
}

interface SubscriptionsListProps {
  subscriptions: Subscription[];
}

export function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  const router = useRouter();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPlanName = (plan: string) => {
    const names: Record<string, string> = {
      DAILY: "24 Hours",
      WEEKLY: "Weekly",
      MONTHLY: "Monthly",
      QUARTERLY: "3 Months",
      SEMI_ANNUAL: "6 Months",
      ANNUAL: "Annual",
    };
    return names[plan] || plan;
  };

  const handleCancel = async (subscriptionId: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }

    setCancellingId(subscriptionId);

    try {
      const result = await cancelSubscription(subscriptionId);

      if (result.success) {
        toast.success("Subscription cancelled successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to cancel subscription");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">
                  {getPlanName(subscription.plan)}
                </h3>
                {getStatusBadge(subscription.status)}
              </div>
              <p className="text-2xl font-bold text-orange-500">
                {subscription.amount.toLocaleString()} {subscription.currency}
              </p>
            </div>

            {subscription.status === "ACTIVE" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancel(subscription.id)}
                disabled={cancellingId === subscription.id}
              >
                {cancellingId === subscription.id ? "Cancelling..." : "Cancel"}
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {subscription.startDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Started: {new Date(subscription.startDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {subscription.endDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {subscription.status === "ACTIVE" ? "Expires" : "Expired"}:{" "}
                  {new Date(subscription.endDate).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="w-4 h-4" />
              <span>
                Auto-renew: {subscription.autoRenew ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          {subscription.status === "ACTIVE" && subscription.endDate && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {Math.ceil(
                    (new Date(subscription.endDate).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days remaining
                </span>
                <Button variant="outline" size="sm" asChild>
                  <a href="/pricing">Renew Now</a>
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
