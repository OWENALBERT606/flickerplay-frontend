"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download, RefreshCw, CheckCircle2, Loader2, AlertCircle,
  Film, Clock, Zap, SkipForward, PlayCircle, Trash2, ImageIcon,
} from "lucide-react";
import {
  getTulabeSyncStatusAction,
  triggerTulabeFullSync,
  triggerTulabeIncrementalSync,
  skipCurrentTulabeMovieAction,
  deleteAllTulabeMoviesAction,
  fixTulabePostersAction,
  getFixTulabePostersProgressAction,
} from "@/actions/admin";

interface TulabeProgress {
  page:         number;
  totalPages:   number;
  processed:    number;
  added:        number;
  failed:       number;
  skipped:      number;
  currentMovie: string | null;
  startedAt:    string | null;
}

interface TulabeStatus {
  synced:   number;
  running:  boolean;
  progress: TulabeProgress;
}

function formatDuration(isoStart: string): string {
  const s = Math.floor((Date.now() - new Date(isoStart).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function calcSpeed(startedAt: string, done: number): string {
  if (done === 0) return "—";
  const hrs  = (Date.now() - new Date(startedAt).getTime()) / 3_600_000;
  const rate = done / hrs;
  return rate >= 1 ? `${rate.toFixed(1)}/hr` : `${(rate * 60).toFixed(1)}/min`;
}

function calcEta(startedAt: string, done: number, total: number): string {
  if (done === 0 || total === 0) return "—";
  const elapsed   = Date.now() - new Date(startedAt).getTime();
  const remaining = ((total - done) * elapsed) / done;
  const s         = Math.floor(remaining / 1000);
  if (s < 60) return `~${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `~${m}m ${s % 60}s`;
  return `~${Math.floor(m / 60)}h ${m % 60}m`;
}

export function TulabeSyncPanel({ initial }: { initial: TulabeStatus | null }) {
  const [status, setStatus]         = useState<TulabeStatus | null>(initial);
  const [error, setError]           = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [fixPostersPending, startFixPostersTransition] = useTransition();
  const [fixPostersProgress, setFixPostersProgress] = useState<{ running: boolean; total: number; done: number; fixed: number; failed: number; skipped: number } | null>(null);
  const [elapsed, setElapsed]       = useState("");
  const [isStuck, setIsStuck]       = useState(false);
  const lastAddedRef                = useRef(initial?.progress.added ?? 0);
  const stuckTimerRef               = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function refresh() {
    const res = await getTulabeSyncStatusAction();
    if (res.success && res.data) setStatus(res.data as TulabeStatus);
    else setError(res.error ?? "Failed to load");
  }

  async function handleFullSync() {
    setError(null);
    startTransition(async () => {
      const res = await triggerTulabeFullSync();
      if (!res.success) setError(res.error ?? "Failed to start");
      await refresh();
    });
  }

  async function handleIncrementalSync() {
    setError(null);
    startTransition(async () => {
      const res = await triggerTulabeIncrementalSync();
      if (!res.success) setError(res.error ?? "Failed to start");
      await refresh();
    });
  }

  async function handleSkip() {
    setError(null);
    startTransition(async () => {
      const res = await skipCurrentTulabeMovieAction();
      if (!res.success) setError(res.error ?? "Failed to skip");
      await refresh();
    });
  }

  async function handleFixPosters() {
    setError(null);
    startFixPostersTransition(async () => {
      const res = await fixTulabePostersAction();
      if (!res.success) { setError(res.error ?? "Failed to start poster fix"); return; }
      const poll = setInterval(async () => {
        const s = await getFixTulabePostersProgressAction();
        if (s.success && s.data) {
          setFixPostersProgress(s.data as any);
          if (!s.data.running) clearInterval(poll);
        }
      }, 2_000);
    });
  }

  async function handleDeleteAll() {
    if (!confirm(`Delete ALL ${status?.synced ?? 0} Tulabe movies from the database and Cloudflare R2? This cannot be undone.`)) return;
    setError(null);
    startDeleteTransition(async () => {
      const res = await deleteAllTulabeMoviesAction();
      if (!res.success) { setError(res.error ?? "Delete failed"); return; }
      await refresh();
    });
  }

  // Poll while running
  useEffect(() => {
    if (!status?.running) return;
    const id = setInterval(refresh, 5_000);
    return () => clearInterval(id);
  }, [status?.running]);

  // Live elapsed timer
  useEffect(() => {
    if (!status?.running || !status.progress.startedAt) { setElapsed(""); return; }
    const tick = () => setElapsed(formatDuration(status.progress.startedAt!));
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [status?.running, status?.progress.startedAt]);

  // Stuck detection
  useEffect(() => {
    if (!status?.running) {
      setIsStuck(false);
      if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
      return;
    }
    const current = status.progress.added;
    if (current !== lastAddedRef.current) {
      lastAddedRef.current = current;
      setIsStuck(false);
      if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
    }
    stuckTimerRef.current = setTimeout(() => setIsStuck(true), 5 * 60 * 1000);
    return () => { if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current); };
  }, [status?.running, status?.progress.added]);

  if (!status) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">{error ?? "Loading Tulabe sync status…"}</p>
      </Card>
    );
  }

  const p         = status.progress;
  const isRunning = status.running;
  const pagePct   = p.totalPages > 0 ? Math.round((p.page / p.totalPages) * 100) : 0;

  return (
    <Card className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 text-purple-500 p-3 rounded-lg">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Tulabe → R2 Sync</h3>
            <p className="text-xs text-muted-foreground">
              Download 549 Tulabe HLS movies and upload to Cloudflare R2
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Badge className="bg-purple-500/20 text-purple-400 border-0 gap-1 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> Running
            </Badge>
          ) : status.synced > 0 ? (
            <Badge className="bg-green-500/20 text-green-400 border-0 gap-1">
              <CheckCircle2 className="w-3 h-3" /> {status.synced} synced
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground gap-1">Idle</Badge>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={refresh} disabled={isPending}>
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stuck warning */}
      {isRunning && isStuck && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="font-medium">Sync appears stuck — no new movies for 5+ minutes.</p>
            <p className="text-muted-foreground">
              The current ffmpeg download may have hung. Click <strong className="text-foreground">Skip Movie</strong> to kill it and continue.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10 mt-1"
              onClick={handleSkip}
              disabled={isPending}
            >
              {isPending
                ? <Loader2 className="w-3 h-3 animate-spin mr-1" />
                : <SkipForward className="w-3 h-3 mr-1" />}
              Skip Movie
            </Button>
          </div>
        </div>
      )}

      {/* Live activity block */}
      {isRunning && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg px-4 py-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 text-xs text-purple-400 font-medium min-w-0">
              <Film className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span className="break-all leading-relaxed">
                {p.currentMovie ? `Processing: ${p.currentMovie}` : `Fetching page ${p.page}…`}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px] text-purple-400 hover:bg-purple-500/10 flex-shrink-0"
              onClick={handleSkip}
              disabled={isPending}
              title="Kill current ffmpeg download and move to next movie"
            >
              <SkipForward className="w-3 h-3 mr-1" /> Skip
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3 text-[10px]">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3 text-purple-400" />
              <span>Elapsed: <span className="text-foreground font-medium">{elapsed || "—"}</span></span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>Speed: <span className="text-foreground font-medium">
                {p.startedAt ? calcSpeed(p.startedAt, p.added) : "—"}
              </span></span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>ETA: <span className="text-foreground font-medium">
                {p.startedAt && p.processed > 0
                  ? calcEta(p.startedAt, p.processed, p.totalPages * 20)
                  : "—"}
              </span></span>
            </div>
          </div>
        </div>
      )}

      {/* Page progress bar (while running) */}
      {isRunning && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Page {p.page} of {p.totalPages} ({p.processed} movies processed)</span>
            <span className="font-medium text-foreground">{pagePct}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${pagePct}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-green-500">
            {isRunning ? p.added : status.synced}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {isRunning ? "Added this run" : "Total Synced"}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-muted-foreground">{isRunning ? p.skipped : "—"}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Skipped</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-red-400">{isRunning ? p.failed : "—"}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Failed</p>
        </div>
      </div>

      {/* Poster fix progress */}
      {fixPostersProgress && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-400 font-medium flex items-center gap-1.5">
              <ImageIcon className={`w-3.5 h-3.5 ${fixPostersProgress.running ? "animate-pulse" : ""}`} />
              Poster fix {fixPostersProgress.running ? `(${fixPostersProgress.done}/${fixPostersProgress.total})` : "(done)"}
            </span>
            <span className="text-muted-foreground">
              {fixPostersProgress.fixed} fixed
              {fixPostersProgress.failed > 0 && ` · ${fixPostersProgress.failed} no match`}
              {fixPostersProgress.skipped > 0 && ` · ${fixPostersProgress.skipped} already OK`}
            </span>
          </div>
          {fixPostersProgress.running && fixPostersProgress.total > 0 && (
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((fixPostersProgress.done / fixPostersProgress.total) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-md px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleIncrementalSync}
          disabled={isPending || isRunning}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          size="sm"
        >
          {isPending || isRunning ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing…</>
          ) : (
            <><PlayCircle className="w-4 h-4 mr-2" /> Sync New Movies</>
          )}
        </Button>
        <Button
          onClick={handleFullSync}
          disabled={isPending || isRunning}
          variant="outline"
          size="sm"
          title="Re-scan all 28 pages — skips already synced movies"
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Full Scan
        </Button>
        {isRunning && (
          <Button
            onClick={handleSkip}
            disabled={isPending}
            variant="outline"
            size="sm"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <SkipForward className="w-4 h-4 mr-1" /> Skip Movie
          </Button>
        )}
        <Button
          onClick={handleFixPosters}
          disabled={fixPostersPending || fixPostersProgress?.running}
          variant="outline"
          size="sm"
          title="Fetch TMDB/OMDB posters for all Tulabe movies missing a poster"
          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
        >
          {fixPostersPending || fixPostersProgress?.running
            ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            : <ImageIcon className="w-4 h-4 mr-1" />}
          Fix Posters
        </Button>
        <Button
          onClick={handleDeleteAll}
          disabled={deletePending || isRunning}
          variant="outline"
          size="sm"
          title="Delete ALL Tulabe movies from DB and R2 — irreversible"
          className="border-red-500/30 text-red-500 hover:bg-red-500/10"
        >
          {deletePending
            ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            : <Trash2 className="w-4 h-4 mr-1" />}
          Delete All
        </Button>
      </div>
    </Card>
  );
}
