"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tv, Trash2, Copy, RefreshCw, AlertCircle, CheckCircle2, Loader2, Film } from "lucide-react";
import {
  syncLabaFilmMoviesToWaitlist,
  syncLabaFilmSeriesAction,
  getSeriesSyncStatusAction,
  debugSeriesApiAction,
  removeMoviesWithoutVideoAction,
  removeDuplicateMoviesAction,
} from "@/actions/admin";
import { toast } from "sonner";

interface SeriesSyncProgress {
  processed: number;
  total: number;
  currentSeries: string | null;
  startedAt: string | null;
  added: number;
  updated: number;
  skipped: number;
  failed: number;
}

interface SeriesSyncStatus {
  total: number;
  perVj: Array<{ vj: string; count: number }>;
  running: boolean;
  progress: SeriesSyncProgress;
}

function formatDuration(isoStart: string): string {
  const ms = Date.now() - new Date(isoStart).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

interface ActionResult {
  label: string;
  value: string | number;
}

export function DbToolsPanel() {
  const [seriesStatus, setSeriesStatus] = useState<SeriesSyncStatus | null>(null);
  const [elapsed, setElapsed] = useState("");
  const [actionResults, setActionResults] = useState<ActionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<string | null>(null);

  async function refreshSeries() {
    const res = await getSeriesSyncStatusAction();
    if (res.success && res.data) setSeriesStatus(res.data as SeriesSyncStatus);
  }

  // Auto-refresh every 5s while series sync is running
  useEffect(() => {
    if (!seriesStatus?.running) return;
    const id = setInterval(refreshSeries, 5_000);
    return () => clearInterval(id);
  }, [seriesStatus?.running]);

  // Elapsed timer while running
  useEffect(() => {
    if (!seriesStatus?.running || !seriesStatus.progress.startedAt) {
      setElapsed("");
      return;
    }
    const tick = () => setElapsed(formatDuration(seriesStatus.progress.startedAt!));
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [seriesStatus?.running, seriesStatus?.progress.startedAt]);

  // Initial load
  useEffect(() => { refreshSeries(); }, []);

  function runAction(label: string, fn: () => Promise<any>) {
    setError(null);
    setActiveAction(label);
    startTransition(async () => {
      const res = await fn();
      setActiveAction(null);
      if (!res.success) {
        setError(res.error ?? "Action failed");
        toast.error(res.error ?? "Action failed");
        return;
      }
      const value = res.message ?? (typeof res.deleted === "number" ? `${res.deleted} deleted` : "Done");
      setActionResults((prev) => [{ label, value }, ...prev].slice(0, 5));
      toast.success(typeof value === "string" ? value : `${label}: ${value}`);
    });
  }

  async function handleSeriesSync() {
    setError(null);
    startTransition(async () => {
      const res = await syncLabaFilmSeriesAction();
      if (!res.success) {
        setError(res.error ?? "Failed to start series sync");
        toast.error(res.error ?? "Failed to start");
        return;
      }
      await refreshSeries();
    });
  }

  const progress = seriesStatus?.progress;
  const isRunning = seriesStatus?.running ?? false;
  const pct = progress && progress.total > 0
    ? Math.round((progress.processed / progress.total) * 100)
    : 0;

  return (
    <Card className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 text-blue-400 p-3 rounded-lg">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Series Sync &amp; DB Tools</h3>
            <p className="text-xs text-muted-foreground">Sync series, clean up, and deduplicate</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <Badge className="bg-blue-500/20 text-blue-400 border-0 gap-1 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> Syncing
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground gap-1">Idle</Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={refreshSeries}
            disabled={isPending}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Series sync live progress */}
      {isRunning && progress && (
        <>
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
              <Film className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {progress.currentSeries ? `Syncing: ${progress.currentSeries}` : "Starting…"}
              </span>
            </div>
            {elapsed && (
              <p className="text-xs text-muted-foreground pl-5">Running for {elapsed}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.processed} of {progress.total} processed</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="bg-muted/50 rounded p-1.5">
                <p className="font-bold text-green-500">{progress.added}</p>
                <p className="text-muted-foreground">Added</p>
              </div>
              <div className="bg-muted/50 rounded p-1.5">
                <p className="font-bold text-blue-400">{progress.updated}</p>
                <p className="text-muted-foreground">Updated</p>
              </div>
              <div className="bg-muted/50 rounded p-1.5">
                <p className="font-bold text-muted-foreground">{progress.skipped}</p>
                <p className="text-muted-foreground">Skipped</p>
              </div>
              <div className="bg-muted/50 rounded p-1.5">
                <p className="font-bold text-red-400">{progress.failed}</p>
                <p className="text-muted-foreground">Failed</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Per-VJ breakdown (when not running) */}
      {!isRunning && seriesStatus && seriesStatus.total > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {seriesStatus.total} series in DB
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(seriesStatus.perVj ?? []).map((v) => (
              <Badge key={v.vj} variant="outline" className="text-[10px] gap-1">
                <span className="text-muted-foreground">{v.vj}</span>
                <span className="font-bold">{v.count}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Series sync buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleSeriesSync}
          disabled={isPending || isRunning}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          {isPending || isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Syncing…
            </>
          ) : (
            <>
              <Tv className="w-4 h-4 mr-2" />
              Sync Series from LabaFilm
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="px-3"
          title="Debug LabaFilm series API response"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const res = await debugSeriesApiAction();
              if (res.success) {
                setDebugInfo(JSON.stringify(res.data, null, 2));
                console.log("[Series Debug]", res.data);
                toast.info("Debug data logged to console");
              } else {
                setDebugInfo(res.error ?? "Error");
                toast.error(res.error ?? "Debug failed");
              }
            });
          }}
        >
          Debug API
        </Button>
      </div>

      {debugInfo && (
        <pre className="text-[10px] bg-muted/50 rounded p-3 overflow-auto max-h-40 text-muted-foreground">
          {debugInfo}
        </pre>
      )}

      <hr className="border-border/50" />

      {/* DB cleanup tools */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">DB Cleanup</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="justify-start gap-2 h-auto py-2.5 px-3"
            disabled={isPending}
            onClick={() => runAction("Sync Movies", syncLabaFilmMoviesToWaitlist)}
          >
            <RefreshCw className={`w-3.5 h-3.5 flex-shrink-0 ${activeAction === "Sync Movies" ? "animate-spin" : ""}`} />
            <div className="text-left">
              <p className="text-xs font-medium">Sync Movies</p>
              <p className="text-[10px] text-muted-foreground">Add new to waitlist</p>
            </div>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="justify-start gap-2 h-auto py-2.5 px-3 border-red-500/30 hover:bg-red-500/10"
            disabled={isPending}
            onClick={() => runAction("Remove No-Video", removeMoviesWithoutVideoAction)}
          >
            <Trash2 className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
            <div className="text-left">
              <p className="text-xs font-medium">No-Video</p>
              <p className="text-[10px] text-muted-foreground">Delete empty entries</p>
            </div>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="justify-start gap-2 h-auto py-2.5 px-3 border-amber-500/30 hover:bg-amber-500/10"
            disabled={isPending}
            onClick={() => runAction("Remove Duplicates", removeDuplicateMoviesAction)}
          >
            <Copy className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
            <div className="text-left">
              <p className="text-xs font-medium">Duplicates</p>
              <p className="text-[10px] text-muted-foreground">Keep best per VJ</p>
            </div>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-md px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {actionResults.length > 0 && (
        <div className="space-y-1">
          {actionResults.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
              <span className="text-muted-foreground">{r.label}:</span>
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">{r.value}</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
