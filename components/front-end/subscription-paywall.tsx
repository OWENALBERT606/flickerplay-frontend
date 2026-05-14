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
      heading: "Free limit reached",
      body: "You've watched 3 movies for free. Subscribe to unlock unlimited access to all 20+ movies and series.",
    },
    series: {
      heading: "Subscription required",
      body: "Series are available on Premium plans. Upgrade to unlock all series.",
    },
    "movie-guest": {
      heading: "Sign in to watch",
      body: "Create a free account to watch more movies, or subscribe for unlimited access.",
    },
    "guest-limit": {
      heading: "Guest limit reached",
      body: "You've watched 1 movie as a guest. Sign in to keep watching for free or subscribe for unlimited access.",
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
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-2 rounded-full ${
                  i < moviesWatched ? "bg-orange-500" : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 text-left">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-gray-800 rounded-lg text-center">
              <p className="text-[10px] text-gray-400 uppercase">Weekly</p>
              <p className="text-sm font-bold text-white">2,000</p>
            </div>
            <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-center">
              <p className="text-[10px] text-orange-500 uppercase font-bold">Monthly</p>
              <p className="text-sm font-bold text-white">6,000</p>
            </div>
            <div className="p-2 bg-gray-800 rounded-lg text-center">
              <p className="text-[10px] text-gray-400 uppercase">2 Weeks</p>
              <p className="text-sm font-bold text-white">3,500</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            {[
              "Unlimited movies & series",
              "Full HD & 4K streaming",
              "Unlimited downloads",
              "Ad-free experience",
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
            <Link href="/pricing">Choose a Plan</Link>
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
