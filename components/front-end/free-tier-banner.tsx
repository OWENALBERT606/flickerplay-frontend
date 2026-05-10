"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Crown } from "lucide-react";
import { FREE_MOVIES_PER_MONTH } from "@/actions/subscription";

interface FreeTierBannerProps {
  moviesWatched: number;
}

export function FreeTierBanner({ moviesWatched }: FreeTierBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const remaining = FREE_MOVIES_PER_MONTH - moviesWatched;

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 to-gray-800 border-b border-orange-500/30">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-orange-400 font-semibold shrink-0">AD</span>
          <span className="text-gray-300">
            Free tier · {remaining} of {FREE_MOVIES_PER_MONTH} free movies remaining this month
          </span>
          <Link
            href="/checkout?plan=monthly"
            className="hidden sm:inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            <Crown className="w-3 h-3" />
            Remove ads — 6,000 UGX/mo
          </Link>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
