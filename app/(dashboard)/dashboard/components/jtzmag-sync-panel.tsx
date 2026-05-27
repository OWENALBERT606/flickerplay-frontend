"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download, RefreshCw, CheckCircle2, Loader2, AlertCircle,
  Film, Clock, Zap, SkipForward, PlayCircle, Wrench, Trash2,
} from "lucide-react";
import {
  getJtzSyncStatusAction,
  triggerJtzFullSync,
  triggerJtzIncrementalSync,
  skipCurrentJtzMovieAction,
  fixJtzContentTypeAction,
  getJtzFixProgressAction,
  redownloadBrokenJtzAction,
  getJtzRedownloadProgressAction,
  deleteAllJtzMoviesAction,
} from "@/actions/admin";

interface JtzProgress {
  scanned: number;
  totalIds: number;
  added: number;
  failed: number;
  skipped: number;
  currentMovie: string | null;
  currentId: number;
  maxId: number;
  startedAt: string | null;
}

interface JtzStatus {
  synced: number;
  running: boolean;
  progress: JtzProgress;
}

interface FixProgress {
  running: boolean;
  total: number;
  fixed: number;
  failed: number;
  skipped: number;
}

interface RedownloadProgress {
  running: boolean;
  total: number;
  checked: number;
  fixed: number;
  failed: number;
  skipped: number;
}

function formatDuration(isoStart: string): string {
  const s = Math.floor((Date.now() - new Date(isoStart).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function calcEta(startedAt: string, done: number, total: number): string {
  if (done === 0) return "calculating…";
  const elapsed = Date.now() - new Date(startedAt).getTime();
  const remaining = ((total - done) * elapsed) / done;
  const s = Math.floor(remaining / 1000);
  if (s < 60) return `~${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `~${m}m ${s % 60}s`;
  return `~${Math.floor(m / 60)}h ${m % 60}m`;
}

function calcSpeed(startedAt: string, done: number): string {
  if (done === 0) return "—";
  const hrs = (Date.now() - new Date(startedAt).getTime()) / 3_600_000;
  const rate = done / hrs;
  return rate >= 1 ? `${rate.toFixed(1)}/hr` : `${(rate * 60).toFixed(1)}/min`;
}

export function JtzSyncPanel({ initial }: { initial: JtzStatus | null }) {
  const [status, setStatus] = useState<JtzStatus | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [fixProgress, setFixProgress] = useState<FixProgress | null>(null);
  const [fixPending, startFixTransition] = useTransition();
  const [redownloadProgress, setRedownloadProgress] = useState<RedownloadProgress | null>(null);
  const [redownloadPending, startRedownloadTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [elapsed, setElapsed] = useState("");
  const [isStuck, setIsStuck] = useState(false);
  const lastAddedRef = useRef(initial?.progress.added ?? 0);
  const stuckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function refresh() {
    const res = await getJtzSyncStatusAction();
    if (res.success && res.data) setStatus(res.data as JtzStatus);
    else setError(res.error ?? "Failed to load");
  }

  async function handleFullSync() {
    setError(null);
    startTransition(async () => {
      const res = await triggerJtzFullSync(3500);
      if (!res.success) setError(res.error ?? "Failed to start");
      await refresh();
    });
  }

  async function handleIncrementalSync() {
    setError(null);
    startTransition(async () => {
      const res = await triggerJtzIncrementalSync(3500);
      if (!res.success) setError(res.error ?? "Failed to start");
      await refresh();
    });
  }

  async function handleSkip() {
    setError(null);
    startTransition(async () => {
      const res = await skipCurrentJtzMovieAction();
      if (!res.success) setError(res.error ?? "Failed to skip");
      await refresh();
    });
  }

  async function handleDeleteAll() {
    if (!confirm(`Delete ALL ${status?.synced ?? 0} JTZ movies from the database and Cloudflare R2? This cannot be undone.`)) return;
    setError(null);
    startDeleteTransition(async () => {
      const res = await deleteAllJtzMoviesAction();
      if (!res.success) { setError(res.error ?? "Delete failed"); return; }
      await refresh();
    });
  }

  async function handleRedownloadBroken() {
    setError(null);
    startRedownloadTransition(async () => {
      const res = await redownloadBrokenJtzAction();
      if (!res.success) { setError(res.error ?? "Failed to start re-download"); return; }
      const poll = setInterval(async () => {
        const s = await getJtzRedownloadProgressAction();
        if (s.success && s.data) {
          setRedownloadProgress(s.data as RedownloadProgress);
          if (!s.data.running) clearInterval(poll);
        }
      }, 3_000);
    });
  }

  async function handleFixContentType() {
    setError(null);
    startFixTransition(async () => {
      const res = await fixJtzContentTypeAction();
      if (!res.success) { setError(res.error ?? "Failed to start fix"); return; }
      // Poll until done
      const poll = setInterval(async () => {
        const s = await getJtzFixProgressAction();
        if (s.success && s.data) {
          setFixProgress(s.data as FixProgress);
          if (!s.data.running) clearInterval(poll);
        }
      }, 2_000);
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
    if (!status?.running || !status.progress.startedAt) {
      setElapsed("");
      return;
    }
    const tick = () => setElapsed(formatDuration(status.progress.startedAt!));
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [status?.running, status?.progress.startedAt]);

  // Stuck detection: no new movies added for 5 minutes while running
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
        <p className="text-sm text-muted-foreground">{error ?? "Loading JTZ sync status…"}</p>
      </Card>
    );
  }

  const p = status.progress;
  const isRunning = status.running;
  const scanPct = p.totalIds > 0 ? Math.round((p.scanned / p.totalIds) * 100) : 0;

  return (
    <Card className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 text-blue-500 p-3 rounded-lg">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">JTZ Magazine → R2 Sync</h3>
            <p className="text-xs text-muted-foreground">
              Scrape jtzmag.com videos and upload to Cloudflare R2
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Badge className="bg-blue-500/20 text-blue-400 border-0 gap-1 animate-pulse">
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
              The current download may have hung. Click <strong className="text-foreground">Skip Movie</strong> to abandon it and continue.
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
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 text-xs text-blue-400 font-medium min-w-0">
              <Film className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span className="break-all leading-relaxed">
                {p.currentMovie
                  ? `Processing: ${p.currentMovie}`
                  : `Scanning ID ${p.currentId}…`}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px] text-blue-400 hover:bg-blue-500/10 flex-shrink-0"
              onClick={handleSkip}
              disabled={isPending}
              title="Kill this download and move to next movie"
            >
              <SkipForward className="w-3 h-3 mr-1" /> Skip
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3 text-[10px]">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>Elapsed: <span className="text-foreground font-medium">{elapsed || "—"}</span></span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>Speed: <span className="text-foreground font-medium">
                {p.startedAt ? calcSpeed(p.startedAt, p.added) : "—"}
              </span></span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3 text-purple-400" />
              <span>ETA: <span className="text-foreground font-medium">
                {p.startedAt && p.totalIds > 0
                  ? calcEta(p.startedAt, p.scanned, p.totalIds)
                  : "—"}
              </span></span>
            </div>
          </div>
        </div>
      )}

      {/* Scan progress bar (only while running) */}
      {isRunning && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Scanned ID {p.currentId} of {p.maxId}
              {" "}({p.scanned} checked)
            </span>
            <span className="font-medium text-foreground">{scanPct}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${scanPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2">
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
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold">{isRunning ? p.maxId : 3500}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Max ID</p>
        </div>
      </div>

      {/* Re-download broken movies progress */}
      {redownloadProgress && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-orange-400 font-medium flex items-center gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${redownloadProgress.running ? "animate-spin" : ""}`} />
              Re-downloading broken files {redownloadProgress.running ? `(${redownloadProgress.checked}/${redownloadProgress.total})` : "(done)"}
            </span>
            <span className="text-muted-foreground">
              {redownloadProgress.fixed} fixed
              {redownloadProgress.failed > 0 && ` · ${redownloadProgress.failed} failed`}
              {redownloadProgress.skipped > 0 && ` · ${redownloadProgress.skipped} ok`}
            </span>
          </div>
          {redownloadProgress.running && redownloadProgress.total > 0 && (
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((redownloadProgress.checked / redownloadProgress.total) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Fix MKV content-type */}
      {fixProgress && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-yellow-400 font-medium flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              MKV → MP4 Fix {fixProgress.running ? "(running…)" : "(done)"}
            </span>
            <span className="text-muted-foreground">
              {fixProgress.fixed}/{fixProgress.total} fixed
              {fixProgress.failed > 0 && ` · ${fixProgress.failed} failed`}
            </span>
          </div>
          {fixProgress.running && fixProgress.total > 0 && (
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((fixProgress.fixed / fixProgress.total) * 100)}%` }}
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
      <div className="flex gap-2">
        <Button
          onClick={handleIncrementalSync}
          disabled={isPending || isRunning}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
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
          title="Full scan from ID 1 — re-checks every ID"
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Full Scan
        </Button>
        <Button
          onClick={handleRedownloadBroken}
          disabled={redownloadPending || redownloadProgress?.running || isRunning}
          variant="outline"
          size="sm"
          title="Re-download all JTZ movies where R2 contains an HTML error page instead of real video (< 50 KB files)"
          className="border-orange-500/30 text-orange-500 hover:bg-orange-500/10"
        >
          {redownloadPending || redownloadProgress?.running
            ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            : <RefreshCw className="w-4 h-4 mr-1" />}
          Fix Broken
        </Button>
        <Button
          onClick={handleFixContentType}
          disabled={fixPending || fixProgress?.running}
          variant="outline"
          size="sm"
          title="Copy existing .mkv R2 objects to .mp4 with video/mp4 content-type so browsers can play them"
          className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
        >
          {fixPending || fixProgress?.running
            ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            : <Wrench className="w-4 h-4 mr-1" />}
          Fix MKV
        </Button>
        <Button
          onClick={handleDeleteAll}
          disabled={deletePending || isRunning}
          variant="outline"
          size="sm"
          title="Delete ALL JTZ movies from DB and R2 — irreversible"
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
