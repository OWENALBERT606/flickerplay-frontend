import Link from "next/link";
import { CheckCircle, Crown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function PaymentSuccessPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">You&apos;re subscribed!</h1>
          <p className="text-gray-400">
            Your Monthly plan is now active. Enjoy unlimited movies and series, ad-free.
          </p>
        </div>

        <div className="bg-gray-900 border border-green-500/20 rounded-xl p-5 space-y-3 text-left">
          <div className="flex items-center gap-2 text-green-400 font-semibold">
            <Crown className="w-4 h-4" />
            Monthly Plan — Active
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
