"use client";

import { Share2 } from "lucide-react";

export function TbShareButton({ title }: { title: string }) {
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-700 bg-gray-900/50 hover:bg-gray-800 text-sm text-white transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
    </div>
  );
}
