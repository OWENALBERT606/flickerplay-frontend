"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tv, Trash2, Copy, RefreshCw, AlertCircle, CheckCircle2,
  Loader2, Film, Clock, Zap, Database, Layers,
} from "lucide-react";
import {
  syncLabaFilmSeriesAction,
  syncLabaFilmSeriesFullAction,
  syncLabaFilmEpisodesAction,
  getSeriesSyncStatusAction,
  debugSeriesApiAction,
  probeEpisodeEndpointsAction,
  removeMoviesWithoutVideoAction,
  removeDuplicateMoviesAction,
} from "@/actions/admin";
import { toast } from "sonner";

interface SeriesSyncProgress {
  processed: number;
  total: number;
  currentSeries: string | null;
  currentEpisode: string | null;
  startedAt: string | null;
  added: number;
  updated: number;
  skipped: number;
  failed: number;
  episodesAdded: number;
  episodesFailed: number;
  seasonsChecked: number;
}

interface SeriesSyncStatus {
  total: number;
  episodeTotal: number;
  perVj: Array<{ vj: string; count: number }>;
  running: boolean;
  progress: SeriesSyncProgress;
}

interface ActionResult {
  label: string;
  value: string | number;
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

  useEffect(() => {
    if (!seriesStatus?.running) return;
    const id = setInterval(refreshSeries, 5_000);
    return () => clearInterval(id);
  }, [seriesStatus?.running]);

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
    <div className="space-y-4">
      {/* ── Series Metadata Sync ─────────────────────────────────────── */}
      <Card className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 text-blue-400 p-3 rounded-lg">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Series Sync</h3>
              <p className="text-xs text-muted-foreground">Sync series metadata + season stubs from LabaFilm</p>
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
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={refreshSeries} disabled={isPending}>
              <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* DB summary — always visible */}
        {seriesStatus && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{seriesStatus.total}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Series in DB</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-400">{seriesStatus.episodeTotal ?? 0}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Episodes in DB</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{seriesStatus.perVj?.length ?? 0}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">VJs active</p>
            </div>
          </div>
        )}

        {/* Per-VJ breakdown — always visible when data exists */}
        {seriesStatus && seriesStatus.perVj?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Per VJ</p>
            <div className="flex flex-wrap gap-1.5">
              {seriesStatus.perVj.map((v) => (
                <Badge key={v.vj} variant="outline" className="text-[10px] gap-1">
                  <span className="text-muted-foreground">{v.vj}</span>
                  <span className="font-bold">{v.count}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Live progress — only while running */}
        {isRunning && progress && (
          <>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3 space-y-2">
              <div className="flex items-start gap-2 text-xs text-blue-400 font-medium">
                <Tv className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span className="break-all leading-relaxed">
                  {progress.currentSeries ? `Series: ${progress.currentSeries}` : "Starting…"}
                </span>
              </div>
              {progress.currentEpisode && (
                <p className="text-xs text-orange-400 pl-5 font-medium">↳ {progress.currentEpisode}</p>
              )}
              <div className="grid grid-cols-3 gap-3 text-[10px]">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>Elapsed: <span className="text-foreground font-medium">{elapsed || "—"}</span></span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span>ETA: <span className="text-foreground font-medium">
                    {progress.startedAt && progress.total > 0
                      ? calcEta(progress.startedAt, progress.processed, progress.total)
                      : "—"}
                  </span></span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Layers className="w-3 h-3 text-purple-400" />
                  <span>{progress.processed} / {progress.total}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress.processed} of {progress.total} series processed</span>
                <span className="font-medium text-foreground">{pct}%</span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {/* Series-level stats */}
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Series metadata</p>
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
                  <p className="text-muted-foreground">Up to date</p>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <p className="font-bold text-red-400">{progress.failed}</p>
                  <p className="text-muted-foreground">Failed</p>
                </div>
              </div>
              {/* Episode-level stats — always visible while running */}
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Episodes</p>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-muted/50 rounded p-1.5">
                  <p className="font-bold text-purple-400">{progress.seasonsChecked ?? 0}</p>
                  <p className="text-muted-foreground">Seasons checked</p>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <p className="font-bold text-orange-400">{progress.episodesAdded}</p>
                  <p className="text-muted-foreground">Videos uploaded</p>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <p className="font-bold text-red-400">{progress.episodesFailed}</p>
                  <p className="text-muted-foreground">Failed</p>
                </div>
              </div>
              {progress.seasonsChecked > 0 && progress.episodesAdded === 0 && (
                <p className="text-[10px] text-amber-500/80 leading-relaxed">
                  {progress.seasonsChecked} season{progress.seasonsChecked !== 1 ? "s" : ""} checked — LabaFilm has not uploaded episode videos for these series yet
                </p>
              )}
            </div>
          </>
        )}

        <div className="space-y-2">
          {/* Primary: full sync (metadata + episodes per series) */}
          <Button
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const res = await syncLabaFilmSeriesFullAction();
                if (!res.success) {
                  setError(res.error ?? "Failed to start");
                  toast.error(res.error ?? "Failed to start");
                  return;
                }
                toast.success("Full series sync started");
                await refreshSeries();
              });
            }}
            disabled={isPending || isRunning}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            {isPending || isRunning ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Syncing…</>
            ) : (
              <><Tv className="w-4 h-4 mr-2" />Sync Series (Metadata + Episodes + Videos)</>
            )}
          </Button>

          {/* Secondary row: individual steps + debug */}
          <div className="flex gap-2">
            <Button
              onClick={handleSeriesSync}
              disabled={isPending || isRunning}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              <Tv className="w-3.5 h-3.5 mr-1.5" />
              Metadata only
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-3 text-xs"
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
        </div>
      </Card>

      {/* ── Episode Video Sync ──────────────────────────────────────── */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 text-orange-500 p-3 rounded-lg">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Episode Video Sync</h3>
            <p className="text-xs text-muted-foreground">Download episode videos from LabaFilm → R2</p>
          </div>
        </div>

        {isRunning && progress?.currentEpisode && (
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg px-4 py-3 space-y-1.5">
            <div className="flex items-start gap-2 text-xs text-orange-400 font-medium">
              <Film className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span className="break-all leading-relaxed">
                {progress.currentSeries ?? "Processing…"}
              </span>
            </div>
            <p className="text-xs text-blue-400 pl-5 font-medium">↳ {progress.currentEpisode}</p>
            <div className="grid grid-cols-2 gap-3 text-[10px] pl-5">
              <span className="text-muted-foreground">
                Videos uploaded: <span className="text-green-500 font-bold">{progress.episodesAdded}</span>
              </span>
              <span className="text-muted-foreground">
                Failed: <span className="text-red-400 font-bold">{progress.episodesFailed}</span>
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => {
              startTransition(async () => {
                const res = await syncLabaFilmEpisodesAction();
                if (!res.success) { toast.error(res.error ?? "Failed"); return; }
                toast.success("Episode sync started — downloading videos to R2");
                await refreshSeries();
              });
            }}
            disabled={isPending || isRunning}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            size="sm"
          >
            {isPending || isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Film className="w-4 h-4 mr-2" />Sync Episodes + Videos</>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3"
            title="Probe all episode URL patterns against a real series"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const res = await probeEpisodeEndpointsAction();
                if (res.success) {
                  setDebugInfo(JSON.stringify(res.data, null, 2));
                  console.log("[Episode Probe]", res.data);
                  toast.info("Episode probe results logged — check the panel");
                } else {
                  setDebugInfo(res.error ?? "Error");
                  toast.error(res.error ?? "Probe failed");
                }
              });
            }}
          >
            Probe Episodes
          </Button>
        </div>

        {debugInfo && (
          <pre className="text-[10px] bg-muted/50 rounded p-3 overflow-auto max-h-48 text-muted-foreground">
            {debugInfo}
          </pre>
        )}
      </Card>

      {/* ── DB Cleanup ───────────────────────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-muted text-muted-foreground p-3 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">DB Cleanup</h3>
            <p className="text-xs text-muted-foreground">Remove orphan records and duplicates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
    </div>
  );
}
