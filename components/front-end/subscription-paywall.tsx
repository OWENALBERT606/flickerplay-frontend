"use client";

import Link from "next/link";
import { Lock, Crown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FREE_MOVIES_PER_MONTH } from "@/lib/constants";

interface SubscriptionPaywallProps {
  type: "movie-limit" | "series" | "movie-guest" | "guest-limit";
  moviesWatched?: number;
  title?: string;
}

export function SubscriptionPaywall({
  type,
  moviesWatched = 0,
  title,
}: SubscriptionPaywallProps) {
  const messages = {
    "movie-limit": {
      heading: "Free movie limit reached",
      body: `You've watched all ${FREE_MOVIES_PER_MONTH} free movies for this month. Upgrade to keep watching.`,
    },
    series: {
      heading: "Subscription required",
      body: "Series are available on the Monthly plan only. Upgrade to unlock all series.",
    },
    "movie-guest": {
      heading: "Sign in to watch",
      body: "Create a free account to watch up to 5 movies per month, or subscribe for unlimited access.",
    },
    "guest-limit": {
      heading: "Guest limit reached",
      body: "You've watched 2 movies as a guest. Sign in to keep watching for free or subscribe for unlimited access.",
    },
  };

  const { heading, body } = messages[type];

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto">
          <Lock className="w-9 h-9 text-orange-500" />
        </div>

        {title && (
          <p className="text-gray-400 text-sm uppercase tracking-widest">
            {title}
          </p>
        )}

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{heading}</h2>
          <p className="text-gray-400">{body}</p>
        </div>

        {type === "movie-limit" && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: FREE_MOVIES_PER_MONTH }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-2 rounded-full ${
                  i < moviesWatched ? "bg-orange-500" : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3 text-left">
          <div className="flex items-center gap-2 text-orange-500 font-semibold">
            <Crown className="w-4 h-4" />
            Monthly Plan — 6,000 UGX/month
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
                <Play className="w-3 h-3 text-orange-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            size="lg"
          >
            <Link href="/checkout?plan=monthly">Subscribe for 6,000 UGX/mo</Link>
          </Button>
          {(type === "movie-guest" || type === "guest-limit") && (
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Create free account</Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="lg" className="text-gray-400">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
