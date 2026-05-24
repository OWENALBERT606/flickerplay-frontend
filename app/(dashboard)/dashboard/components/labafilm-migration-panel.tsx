"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, RefreshCw, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { getLabaFilmMigrationStatus, triggerLabaFilmMigration } from "@/actions/admin";

interface MigrationStatus {
  migrated: number;
  pending: number;
  total: number;
  running: boolean;
  progress: { migrated: number; total: number };
}

export function LabaFilmMigrationPanel({
  initial,
}: {
  initial: MigrationStatus | null;
}) {
  const [status, setStatus] = useState<MigrationStatus | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function refresh() {
    const res = await getLabaFilmMigrationStatus();
    if (res.success && res.data) setStatus(res.data);
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

  // Auto-refresh every 15s while migration is running
  useEffect(() => {
    if (!status?.running) return;
    const id = setInterval(refresh, 15_000);
    return () => clearInterval(id);
  }, [status?.running]);

  if (!status) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          {error ?? "Loading migration status…"}
        </p>
      </Card>
    );
  }

  const pct = status.total > 0 ? Math.round((status.migrated / status.total) * 100) : 0;
  const isDone = status.pending === 0 && status.total > 0;
  const isRunning = status.running;

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
            <p className="text-xs text-muted-foreground">
              Upload LabaFilm videos to Cloudflare R2
            </p>
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
            <Badge variant="outline" className="text-muted-foreground gap-1">
              Idle
            </Badge>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={refresh}
            disabled={isPending}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{status.migrated} of {status.total} migrated</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-green-500">{status.migrated}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Migrated</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-orange-500">{status.pending}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xl font-bold">{status.total}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-md px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Action button */}
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
