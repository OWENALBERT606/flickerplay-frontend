import Link from "next/link";
import { CheckCircle, Crown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/actions/auth";
import { getPaymentStatus } from "@/actions/payments";
import { redirect } from "next/navigation";

const PLAN_INFO: Record<string, { name: string; duration: string }> = {
  TEST:        { name: "Test Plan",       duration: "1 hour" },
  DAILY:       { name: "Daily Plan",      duration: "1 day" },
  WEEKLY:      { name: "Weekly Plan",     duration: "7 days" },
  TWO_WEEKS:   { name: "2-Week Plan",     duration: "14 days" },
  MONTHLY:     { name: "Monthly Plan",    duration: "30 days" },
  QUARTERLY:   { name: "Quarterly Plan",  duration: "90 days" },
  SEMI_ANNUAL: { name: "6-Month Plan",    duration: "180 days" },
  ANNUAL:      { name: "Annual Plan",     duration: "365 days" },
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { paymentId?: string };
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const paymentId = searchParams.paymentId;

  let planName = "Subscription";
  let duration = "";
  let daysLeft: number | null = null;

  if (paymentId) {
    const result = await getPaymentStatus(paymentId);
    const sub = result.data?.subscription;
    if (sub?.plan) {
      const info = PLAN_INFO[sub.plan as string] ?? { name: sub.plan, duration: "" };
      planName = info.name;
      duration = info.duration;
    }
    if (sub?.endDate) {
      daysLeft = Math.ceil(
        (new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
    }
  }

  const expiryText =
    daysLeft !== null && daysLeft > 0
      ? `Your subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
      : duration
      ? `Your ${planName} is valid for ${duration}.`
      : "Your subscription is now active.";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">You&apos;re subscribed!</h1>
          <p className="text-gray-400">
            Your {planName} is now active. Enjoy unlimited movies and series, ad-free.
          </p>
        </div>

        <div className="bg-gray-900 border border-green-500/20 rounded-xl p-5 space-y-3 text-left">
          <div className="flex items-center gap-2 text-green-400 font-semibold">
            <Crown className="w-4 h-4" />
            {planName} — Active
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            {[
              "Unlimited movies & series",
              "Full HD & 4K streaming",
              "Unlimited downloads",
              "Ad-free experience",
              "Watch on up to 3 devices",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-green-500/20">
            <p className="text-sm text-gray-400">{expiryText} You can cancel anytime.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-orange-500 hover:bg-orange-600" size="lg">
            <Link href="/movies">
              <Play className="w-4 h-4 mr-2" />
              Start Watching
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/account/subscriptions">View Subscription</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
