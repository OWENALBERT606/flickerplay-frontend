"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { fixAllPostersAction, getFixAllPostersProgressAction } from "@/actions/admin";

interface FixAllProgress {
  running:      boolean;
  total:        number;
  done:         number;
  fixed:        number;
  skipped:      number;
  failed:       number;
  currentMovie: string | null;
}

export function FixAllPostersPanel() {
  const [progress, setProgress] = useState<FixAllProgress | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleStart() {
    setError(null);
    startTransition(async () => {
      const res = await fixAllPostersAction();
      if (!res.success) { setError(res.error ?? "Failed to start"); return; }

      const poll = setInterval(async () => {
        const s = await getFixAllPostersProgressAction();
        if (s.success && s.data) {
          setProgress(s.data as FixAllProgress);
          if (!s.data.running) clearInterval(poll);
        }
      }, 2_000);
    });
  }

  const pct = progress && progress.total > 0
    ? Math.round((progress.done / progress.total) * 100)
    : 0;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 text-orange-500 p-3 rounded-lg">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Fix All Broken Posters</h3>
            <p className="text-xs text-muted-foreground">
              Replace every non-R2 image (media.labacdn.xyz, cdn.tulabe.com) with TMDB/OMDB posters uploaded to R2
            </p>
          </div>
        </div>
        {progress && !progress.running && progress.done > 0 && (
          <Badge className="bg-green-500/20 text-green-400 border-0 gap-1">
            <CheckCircle2 className="w-3 h-3" /> Done
          </Badge>
        )}
        {progress?.running && (
          <Badge className="bg-orange-500/20 text-orange-400 border-0 gap-1 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Running
          </Badge>
        )}
      </div>

      {progress && (
        <div className="space-y-2">
          {progress.running && progress.currentMovie && (
            <p className="text-xs text-muted-foreground truncate">
              Processing: <span className="text-foreground">{progress.currentMovie}</span>
            </p>
          )}

          {progress.total > 0 && (
            <>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress.done} / {progress.total} movies</span>
                <span className="font-medium text-foreground">{pct}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <p className="text-base font-bold text-green-500">{progress.fixed}</p>
              <p className="text-[10px] text-muted-foreground">Fixed</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <p className="text-base font-bold text-muted-foreground">{progress.skipped}</p>
              <p className="text-[10px] text-muted-foreground">Already OK</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <p className="text-base font-bold text-red-400">{progress.failed}</p>
              <p className="text-[10px] text-muted-foreground">No Match</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-md px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <Button
        onClick={handleStart}
        disabled={isPending || progress?.running}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        size="sm"
      >
        {isPending || progress?.running ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fixing posters…</>
        ) : (
          <><ImageIcon className="w-4 h-4 mr-2" /> Fix All Broken Posters (~{progress?.total ?? 1050} movies)</>
        )}
      </Button>
    </Card>
  );
}
