"use client";

import { Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSessionStore } from "@/store/authStore";
import { checkDownloadLimitAction, recordDownloadAction } from "@/actions/downloads";

interface MovieDownloadButtonProps {
  movieId: string;
  movieTitle: string;
  downloadUrl?: string | null;
}

export function MovieDownloadButton({ movieId, movieTitle, downloadUrl }: MovieDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);
  const { isAuthenticated } = useSessionStore();

  useEffect(() => {
    if (!isAuthenticated || !downloadUrl) return;
    checkDownloadLimitAction().then((res) => {
      if (res.data) {
        setRemaining(res.data.remainingDownloads ?? null);
        setLimit(res.data.limit ?? null);
      }
    });
  }, [isAuthenticated, downloadUrl]);

  const handleDownload = async () => {
    if (!downloadUrl) { toast.error("Download not available for this movie"); return; }
    if (!isAuthenticated) { toast.error("Please sign in to download movies"); return; }

    try {
      setIsDownloading(true);

      const checkRes = await checkDownloadLimitAction();
      if (checkRes.error || !checkRes.data?.canDownload) {
        const msg = checkRes.data?.limit === 1
          ? "Free accounts get 1 download per day. Upgrade to a paid plan for 3 downloads per day."
          : "You have used all 3 downloads for today. Try again tomorrow.";
        toast.error(msg);
        return;
      }

      await recordDownloadAction(movieId);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${movieTitle.replace(/[^a-z0-9]/gi, "_")}.mp4`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setRemaining((r) => (r !== null ? Math.max(0, r - 1) : null));
      toast.success("Download started!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to start download");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!downloadUrl) return null;

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        onClick={handleDownload}
        disabled={isDownloading || (remaining !== null && remaining === 0)}
        variant="outline"
        className="bg-gray-900/80 border-gray-700 hover:bg-gray-800 hover:border-gray-600 text-white gap-2"
      >
        {isDownloading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Preparing...</>
        ) : (
          <><Download className="h-4 w-4" /> Download Movie</>
        )}
      </Button>
      {isAuthenticated && remaining !== null && limit !== null && (
        <p className="text-xs text-muted-foreground">
          {remaining} of {limit} download{limit !== 1 ? "s" : ""} remaining today
        </p>
      )}
    </div>
  );
}