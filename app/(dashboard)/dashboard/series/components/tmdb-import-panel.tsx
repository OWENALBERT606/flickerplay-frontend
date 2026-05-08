"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Tv } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { searchSeriesMetadata, importSeriesFromTmdb, type MetadataCandidate } from "@/actions/metadata";

interface TmdbImportPanelProps {
  seriesId: string;
  seriesTitle: string;
  seriesPoster: string;
}

export function TmdbImportPanel({ seriesId, seriesTitle, seriesPoster }: TmdbImportPanelProps) {
  const router = useRouter();
  const [query, setQuery]               = useState(seriesTitle);
  const [searching, setSearching]       = useState(false);
  const [candidates, setCandidates]     = useState<MetadataCandidate[]>([]);
  const [selected, setSelected]         = useState<MetadataCandidate | null>(null);
  const [importing, setImporting]       = useState(false);
  const [done, setDone]                 = useState(false);
  const [result, setResult]             = useState<{ seasons: number; episodes: number } | null>(null);
  const [open, setOpen]                 = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setCandidates([]);
    setSelected(null);
    try {
      const results = await searchSeriesMetadata(query.trim());
      setCandidates(results);
      if (results.length === 0) toast.info("No results found — try a different title");
    } catch {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async () => {
    if (!selected) { toast.error("Select a series first"); return; }
    setImporting(true);
    toast.loading(`Importing seasons & episodes for "${selected.title}"…`, { id: "import" });
    try {
      const res = await importSeriesFromTmdb(seriesId, selected.tmdbId, seriesPoster);
      if (res.success) {
        setResult({ seasons: res.seasonsCreated || 0, episodes: res.episodesCreated || 0 });
        setDone(true);
        toast.success(
          `✅ Imported ${res.seasonsCreated} seasons and ${res.episodesCreated} episodes!`,
          { id: "import", duration: 6000 }
        );
        router.refresh();
      } else {
        toast.error(res.error || "Import failed", { id: "import" });
      }
    } catch (e: any) {
      toast.error(e.message || "Import failed", { id: "import" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="border-orange-500/20">
      <CardHeader className="pb-3">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex items-center justify-between w-full text-left"
        >
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="w-4 h-4 text-orange-500" />
            Import Seasons & Episodes from TMDB
            {done && result && (
              <Badge className="bg-green-500 text-xs ml-2">
                {result.seasons}S · {result.episodes}E imported
              </Badge>
            )}
          </CardTitle>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Search for the correct series on TMDB, select it, then click Import to automatically create all seasons and episodes.
            You only need to upload the video files afterwards.
          </p>

          {/* Search bar */}
          <div className="flex gap-2">
            <Input
              placeholder="Search series name on TMDB…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              disabled={searching || importing}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleSearch}
              disabled={searching || importing || !query.trim()}
              variant="outline"
              className="shrink-0 gap-1.5"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>

          {/* Results */}
          {candidates.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                {candidates.length} results — click the correct series:
              </p>
              <div className="max-h-64 overflow-y-auto border border-border rounded-xl divide-y divide-border">
                {candidates.map(c => (
                  <button
                    key={c.tmdbId}
                    type="button"
                    onClick={() => setSelected(c)}
                    className={`w-full flex items-center gap-3 px-3 py-3 transition-colors text-left ${
                      selected?.tmdbId === c.tmdbId
                        ? "bg-orange-500/10 border-l-2 border-orange-500"
                        : "hover:bg-muted/60"
                    }`}
                  >
                    {/* Poster */}
                    <div className="w-10 h-14 rounded overflow-hidden bg-muted shrink-0">
                      {c.poster
                        ? <Image src={c.poster} alt={c.title} width={40} height={56} className="object-cover w-full h-full" />
                        : <div className="w-full h-full flex items-center justify-center"><Tv className="w-4 h-4 text-muted-foreground" /></div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1">{c.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {c.year && <Badge variant="secondary" className="text-xs">{c.year}</Badge>}
                        <span className="text-[10px] text-muted-foreground">ID: {c.tmdbId}</span>
                      </div>
                      {c.overview && <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{c.overview}</p>}
                    </div>

                    {selected?.tmdbId === c.tmdbId && (
                      <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected + Import button */}
          {selected && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-1">{selected.title}</p>
                  <p className="text-xs text-muted-foreground">TMDB ID: {selected.tmdbId} {selected.year && `· ${selected.year}`}</p>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-2"
              >
                {importing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Importing seasons & episodes…</>
                ) : (
                  <><Download className="w-4 h-4" />Import All Seasons & Episodes from "{selected.title}"</>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                This will create all seasons and episodes automatically. You only need to upload the video files.
              </p>
            </div>
          )}

          {/* Done state */}
          {done && result && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">Import complete!</p>
                <p className="text-xs text-muted-foreground">
                  {result.seasons} seasons and {result.episodes} episodes created. Now upload the video files for each episode.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
