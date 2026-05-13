import { getSession } from "@/actions/auth";
import { getUserSubscriptions } from "@/actions/payments";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Crown, CheckCircle2 } from "lucide-react";
import { SubscriptionsList } from "./components/subscription-list";

export default async function SubscriptionsPage() {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const result = await getUserSubscriptions(userId);
  const subscriptions = result.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your subscription plans and billing
          </p>
        </div>
        <Link href="/pricing">
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Active Subscription</h3>
          <p className="text-muted-foreground mb-6">
            Subscribe to Premium for only 10,000 UGX/month to unlock unlimited downloads, no ads, and access to all premium content.
          </p>
          <div className="bg-secondary/50 p-4 rounded-lg mb-6 text-left max-w-md mx-auto">
            <h4 className="font-semibold mb-2">Current Free Plan Benefits:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Watch all movies and series (with ads)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                1 download per day
              </li>
            </ul>
          </div>
          <Link href="/pricing">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Upgrade to Premium
            </Button>
          </Link>
        </Card>
      ) : (
        <SubscriptionsList subscriptions={subscriptions} />
      )}
    </div>
  );
}