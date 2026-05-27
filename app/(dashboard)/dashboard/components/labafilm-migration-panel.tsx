"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CloudUpload, RefreshCw, CheckCircle2, Loader2, AlertCircle,
  Film, Clock, Zap, XCircle, SkipForward,
} from "lucide-react";
import { getLabaFilmMigrationStatus, triggerLabaFilmMigration, skipCurrentMigrationMovie } from "@/actions/admin";

interface MigrationStatus {
  migrated: number;
  pending: number;
  total: number;
  running: boolean;
  progress: {
    migrated: number;
    total: number;
    failed: number;
    skipped: number;
    currentMovie: string | null;
    startedAt: string | null;
  };
}

function formatDuration(isoStart: string): string {
  const ms = Date.now() - new Date(isoStart).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function calcEta(startedAt: string, done: number, total: number): string {
  if (done === 0) return "calculating…";
  const elapsed = Date.now() - new Date(startedAt).getTime();
  const msPerItem = elapsed / done;
  const remaining = (total - done) * msPerItem;
  const s = Math.floor(remaining / 1000);
  if (s < 60) return `~${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `~${m}m ${s % 60}s`;
  return `~${Math.floor(m / 60)}h ${m % 60}m`;
}

function calcSpeed(startedAt: string, done: number): string {
  if (done === 0) return "—";
  const elapsedHr = (Date.now() - new Date(startedAt).getTime()) / 3_600_000;
  const rate = done / elapsedHr;
  return rate >= 1 ? `${rate.toFixed(1)}/hr` : `${(rate * 60).toFixed(1)}/min`;
}

export function LabaFilmMigrationPanel({
  initial,
}: {
  initial: MigrationStatus | null;
}) {
  const [status, setStatus] = useState<MigrationStatus | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [elapsed, setElapsed] = useState<string>("");
  const [isStuck, setIsStuck] = useState(false);
  const lastMigratedRef = useRef(initial?.progress.migrated ?? 0);
  const stuckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function refresh() {
    const res = await getLabaFilmMigrationStatus();
    if (res.success && res.data) setStatus(res.data as MigrationStatus);
    else setError(res.error ?? "Failed to load");
  }

  async function handleStart() {
    setError(null);
    startTransition(async () => {
      const res = await triggerLabaFilmMigration();
      if (!res.success) setError(res.error ?? "Failed to start");
      await refresh();
    });
  }

  async function handleSkip() {
    setError(null);
    startTransition(async () => {
      const res = await skipCurrentMigrationMovie();
      if (!res.success) setError(res.error ?? "Failed to skip");
      await refresh();
    });
  }

  // Auto-start migration if there are pending movies on first load
  useEffect(() => {
    if (!status) return;
    if (!status.running && status.pending > 0) {
      handleStart();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!status?.running) return;
    const id = setInterval(refresh, 5_000);
    return () => clearInterval(id);
  }, [status?.running]);

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

  // Detect stuck migration: no new migrated count for 5 minutes while running
  useEffect(() => {
    if (!status?.running) {
      setIsStuck(false);
      if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
      return;
    }
    const current = status.progress.migrated;
    if (current !== lastMigratedRef.current) {
      lastMigratedRef.current = current;
      setIsStuck(false);
      if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
    }
    stuckTimerRef.current = setTimeout(() => setIsStuck(true), 5 * 60 * 1000);
    return () => { if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current); };
  }, [status?.running, status?.progress.migrated]);

  if (!status) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">{error ?? "Loading migration status…"}</p>
      </Card>
    );
  }

  const p = status.progress;
  const isRunning = status.running;
  const isDone = status.pending === 0 && status.total > 0;
  const pct = status.total > 0 ? Math.round((status.migrated / status.total) * 100) : 0;
  const runPct = p.total > 0 ? Math.round((p.migrated / p.total) * 100) : 0;

  return (
    <Card className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 text-orange-500 p-3 rounded-lg">
            <CloudUpload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">LabaFilm → R2 Migration</h3>
            <p className="text-xs text-muted-foreground">Upload LabaFilm videos to Cloudflare R2</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDone ? (
            <Badge className="bg-green-500/20 text-green-400 border-0 gap-1">
              <CheckCircle2 className="w-3 h-3" /> Complete
            </Badge>
          ) : isRunning ? (
            <Badge className="bg-orange-500/20 text-orange-400 border-0 gap-1 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> Running
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
            <p className="font-medium">Migration appears stuck — no progress for 5+ minutes.</p>
            <p className="text-muted-foreground">The download may have hung. Click <strong className="text-foreground">Skip Movie</strong> to kill it and move to the next one.</p>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10 mt-1"
              onClick={handleSkip}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <SkipForward className="w-3 h-3 mr-1" />}
              Skip Movie
            </Button>
          </div>
        </div>
      )}

      {/* Live activity block */}
      {isRunning && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg px-4 py-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 text-xs text-orange-400 font-medium min-w-0">
              <Film className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span className="break-all leading-relaxed">
                {p.currentMovie ? `Processing: ${p.currentMovie}` : "Starting…"}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px] text-orange-400 hover:bg-orange-500/10 flex-shrink-0"
              onClick={handleSkip}
              disabled={isPending}
              title="Kill this download and move to next movie"
            >
              <SkipForward className="w-3 h-3 mr-1" />
              Skip
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
                {p.startedAt ? calcSpeed(p.startedAt, p.migrated) : "—"}
              </span></span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3 text-purple-400" />
              <span>ETA: <span className="text-foreground font-medium">
                {p.startedAt && p.total > 0 ? calcEta(p.startedAt, p.migrated, p.total) : "—"}
              </span></span>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {isRunning
              ? `${p.migrated} of ${p.total} processed this run`
              : `${status.migrated} of ${status.total} migrated to R2`}
          </span>
          <span className="font-medium text-foreground">{isRunning ? runPct : pct}%</span>
        </div>
        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${isRunning ? runPct : pct}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-green-500">{isRunning ? p.migrated : status.migrated}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Migrated</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-orange-400">{status.pending}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Pending</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-red-400">{isRunning ? p.failed : "—"}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Failed</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-muted-foreground">{isRunning ? p.skipped : "—"}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Skipped</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold">{status.total}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Total</p>
        </div>
      </div>

      {status.total === 0 && !isRunning && (
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-md px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          No movies in DB yet — run <strong className="mx-1">Sync All Movies → R2</strong> below first.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-md px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {!isDone && (
        <Button
          onClick={handleStart}
          disabled={isPending || isRunning}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          size="sm"
        >
          {isPending || isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Migration running…
            </>
          ) : (
            <>
              <CloudUpload className="w-4 h-4 mr-2" />
              {status.migrated > 0 ? "Resume Migration" : "Start Migration"}
            </>
          )}
        </Button>
      )}
    </Card>
  );
}
