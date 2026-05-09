"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, ChevronDown, ChevronUp, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";
import { createSeason, updateSeason, type Season } from "@/actions/series";
import { Dropzone, FileWithMetadata } from "@/components/ui/dropzone";
import {
  enrichSeasonMetadata,
  searchSeriesMetadata,
  type TmdbSeasonMeta,
  type TmdbEpisodeMeta,
  type MetadataCandidate,
} from "@/actions/metadata";

interface SeasonFormProps {
  seriesId: string;
  season?: Season;
  seriesPoster?: string;
  seriesTrailerPoster?: string;
  seriesTitle?: string;
}

export function SeasonForm({ seriesId, season, seriesPoster, seriesTrailerPoster, seriesTitle }: SeasonFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    seasonNumber: season?.seasonNumber?.toString() || "",
    title:        season?.title        || "",
    description:  season?.description  || "",
    poster:       season?.poster       || seriesPoster || "",
    trailerUrl:   season?.trailerUrl   || "",
    releaseYear:  season?.releaseYear?.toString() || "",
  });

  /* ── TMDB state ── */
  const [mounted, setMounted]               = useState(false);
  const [tmdbSeriesId, setTmdbSeriesId]     = useState<number | null>(null);
  const [confirmedTitle, setConfirmedTitle] = useState<string | null>(null);
  const [query, setQuery]                   = useState(seriesTitle || "");
  const [candidates, setCandidates]         = useState<MetadataCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [enriching, setEnriching]           = useState(false);
  const [metaFilled, setMetaFilled]         = useState(false);
  const [posterOptions, setPosterOptions]   = useState<string[]>([]);
  const [selectedPosterIdx, setSelectedPosterIdx] = useState(0);
  const [episodesMeta, setEpisodesMeta]     = useState<TmdbEpisodeMeta[]>([]);
  const [showEpisodes, setShowEpisodes]     = useState(false);

  /* Dropzone */
  const [posterFiles, setPosterFiles]   = useState<FileWithMetadata[]>([]);
  const [trailerFiles, setTrailerFiles] = useState<FileWithMetadata[]>([]);

  const isEditing = !!season;

  useEffect(() => { if (posterFiles[0]?.publicUrl)  setFormData(p => ({ ...p, poster:     posterFiles[0].publicUrl! })); }, [posterFiles]);
  useEffect(() => { if (trailerFiles[0]?.publicUrl) setFormData(p => ({ ...p, trailerUrl: trailerFiles[0].publicUrl! })); }, [trailerFiles]);

  /* ── Auto-search TMDB on mount — just set mounted, don't auto-search ── */
  useEffect(() => {
    setMounted(true);
    if (!seriesTitle || isEditing) return;
    // Check localStorage for previously confirmed series
    const stored = localStorage.getItem(`series_tmdb_${seriesId}`);
    if (stored) {
      const storedName = localStorage.getItem(`series_tmdb_name_${seriesId}`);
      setTmdbSeriesId(parseInt(stored));
      setConfirmedTitle(storedName || seriesTitle);
    }
  }, [seriesTitle, seriesId, isEditing]);

  /* ── Manual search ── */
  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoadingCandidates(true);
    setCandidates([]);
    setTmdbSeriesId(null);
    setConfirmedTitle(null);
    try {
      const results = await searchSeriesMetadata(query.trim());
      setCandidates(results);
      if (results.length === 0) toast.info("No results — try a different name");
    } catch { toast.error("Search failed"); }
    finally { setLoadingCandidates(false); }
  };

  /* ── Select a candidate from the list ── */
  const selectCandidate = (c: MetadataCandidate) => {
    setTmdbSeriesId(c.tmdbId);
    setConfirmedTitle(c.title);
    localStorage.setItem(`series_tmdb_${seriesId}`, String(c.tmdbId));
    localStorage.setItem(`series_tmdb_name_${seriesId}`, c.title);
    setCandidates([]);
    setMetaFilled(false);
    toast.success(`Using: ${c.title} (TMDB ID: ${c.tmdbId})`);
  };

  /* ── Fetch season metadata ── */
  const handleEnrich = async () => {
    const sNum = parseInt(formData.seasonNumber);
    if (!tmdbSeriesId) { toast.error("Select the correct series from TMDB first"); return; }
    if (!formData.seasonNumber || isNaN(sNum)) { toast.error("Enter the season number first"); return; }

    setEnriching(true);
    toast.loading(`Fetching Season ${sNum} of "${confirmedTitle}"…`, { id: "season-enrich" });

    try {
      const data: TmdbSeasonMeta | null = await enrichSeasonMetadata(tmdbSeriesId, sNum);
      if (!data) throw new Error(`Season ${sNum} not found on TMDB for "${confirmedTitle}"`);

      const seasonPoster = seriesPoster || "";  // always use series poster
      setFormData(prev => ({
        ...prev,
        title:       data.title       || prev.title,
        description: data.description || prev.description,
        poster:      seasonPoster,               // always series poster
        releaseYear: prev.releaseYear,           // keep series year, don't overwrite
      }));

      if (data.posterOptions.length) { setPosterOptions(data.posterOptions); setSelectedPosterIdx(0); }

      const enrichedEpisodes = data.episodes.map(ep => ({
        ...ep,
        poster: seriesPoster || null,  // always series poster for episodes too
      }));
      setEpisodesMeta(enrichedEpisodes);
      setMetaFilled(true);
      setShowEpisodes(true);
      toast.success(`Season ${sNum} auto-filled! ${enrichedEpisodes.length} episode(s) ready.`, { id: "season-enrich" });
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch season metadata", { id: "season-enrich" });
    } finally {
      setEnriching(false);
    }
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seasonNumber) { toast.error("Season number is required"); return; }
    setIsLoading(true);
    try {
      const payload = {
        seasonNumber: parseInt(formData.seasonNumber),
        title:        formData.title       || undefined,
        description:  formData.description || undefined,
        poster:       formData.poster      || undefined,
        trailerUrl:   formData.trailerUrl  || undefined,
        releaseYear:  formData.releaseYear ? parseInt(formData.releaseYear) : undefined,
      };
      const result = isEditing ? await updateSeason(season.id, payload) : await createSeason(seriesId, payload);
      if (result.success) {
        toast.success(isEditing ? "Season updated!" : "Season created!");
        router.push(`/dashboard/series/${seriesId}`);
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch { toast.error("An unexpected error occurred"); }
    finally { setIsLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── TMDB Auto-fill panel — only after hydration ── */}
      {!isEditing && mounted && (
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardContent className="pt-4 pb-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-semibold text-orange-600">Auto-fill from TMDB</p>
            </div>

            {/* Step 1 — search by name */}
            {!tmdbSeriesId && (
              <>
                <p className="text-xs text-muted-foreground">
                  Search the series name to find it on TMDB, then select the correct result.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder={`Search series… (e.g. "${seriesTitle}")`}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    disabled={loadingCandidates}
                    className="flex-1 text-sm"
                  />
                  <Button
                    type="button"
                    onClick={handleSearch}
                    disabled={loadingCandidates || !query.trim()}
                    variant="outline"
                    className="shrink-0 gap-1.5"
                  >
                    {loadingCandidates
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Search className="w-4 h-4" />}
                    Search
                  </Button>
                </div>

                {/* Results */}
                {candidates.length > 0 && (
                  <div className="border border-border rounded-xl overflow-hidden divide-y divide-border max-h-56 overflow-y-auto">
                    {candidates.map(c => (
                      <button
                        key={c.tmdbId}
                        type="button"
                        onClick={() => selectCandidate(c)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
                      >
                        <div className="w-8 h-12 rounded overflow-hidden bg-muted shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {c.poster && <img src={c.poster} alt={c.title} className="object-cover w-full h-full" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.year && `${c.year} · `}ID: {c.tmdbId}</p>
                          {c.overview && <p className="text-[10px] text-muted-foreground line-clamp-1">{c.overview}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Step 2 — series confirmed, fetch season */}
            {tmdbSeriesId && confirmedTitle && (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-green-700 line-clamp-1">{confirmedTitle}</p>
                    <p className="text-[10px] text-muted-foreground">TMDB ID: {tmdbSeriesId}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setTmdbSeriesId(null); setConfirmedTitle(null); setCandidates([]); setMetaFilled(false); setQuery(seriesTitle || ""); }}
                    className="text-xs text-muted-foreground hover:text-foreground underline shrink-0"
                  >
                    Change
                  </button>
                </div>

                <Button
                  type="button"
                  onClick={handleEnrich}
                  disabled={enriching || !formData.seasonNumber}
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                >
                  {enriching
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Fetching Season {formData.seasonNumber}…</>
                    : `Fetch Season ${formData.seasonNumber || "?"} Data`
                  }
                </Button>
              </>
            )}

            {metaFilled && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Season + {episodesMeta.length} episodes auto-filled
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Season Number ── */}
      <div className="space-y-2">
        <Label>Season Number <span className="text-destructive">*</span></Label>
        <Input
          type="number" min="1" placeholder="e.g., 1"
          value={formData.seasonNumber}
          onChange={e => { setFormData(p => ({ ...p, seasonNumber: e.target.value })); setMetaFilled(false); }}
          required disabled={isLoading}
        />
      </div>

      {/* ── Title ── */}
      <div className="space-y-2">
        <Label>Season Title (Optional) {metaFilled && formData.title && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}</Label>
        <Input placeholder="e.g., The Beginning" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} disabled={isLoading} />
      </div>

      {/* ── Release Year ── */}
      <div className="space-y-2">
        <Label>Release Year</Label>
        <Input type="number" min="1900" max="2100" placeholder="e.g., 2024" value={formData.releaseYear} onChange={e => setFormData(p => ({ ...p, releaseYear: e.target.value }))} disabled={isLoading} />
        <p className="text-xs text-muted-foreground">Uses the series release year by default</p>
      </div>

      {/* ── Description ── */}
      <div className="space-y-2">
        <Label>Description {metaFilled && formData.description && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}</Label>
        <Textarea placeholder="Season description…" rows={3} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} disabled={isLoading} />
      </div>

      {/* Current poster preview */}
      {formData.poster && !posterFiles.length && (
        <div className="space-y-1">
          <Label>Current Poster</Label>
          <div className="relative w-20 h-28 rounded overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={formData.poster} alt="poster" className="w-full h-full object-cover" />
          </div>
          <p className="text-xs text-muted-foreground">Upload below to override</p>
        </div>
      )}

      {/* ── Poster Upload ── */}
      <div className="space-y-2">
        <Label>Season Poster (Optional)</Label>
        <Dropzone provider="cloudflare-r2" variant="compact" maxFiles={1} maxSize={1024*1024*5} accept={{ "image/*": [".png",".jpg",".jpeg",".webp"] }} onFilesChange={setPosterFiles} disabled={isLoading} />
      </div>

      {/* ── Trailer Upload ── */}
      <div className="space-y-2">
        <Label>Season Trailer (Optional)</Label>
        <Dropzone provider="cloudflare-r2" variant="compact" maxFiles={1} maxSize={1024*1024*100} accept={{ "video/*": [".mp4",".mov",".avi",".mkv"] }} onFilesChange={setTrailerFiles} disabled={isLoading} />
      </div>

      {/* ── Episode preview ── */}
      {episodesMeta.length > 0 && (
        <div className="space-y-2">
          <button type="button" onClick={() => setShowEpisodes(s => !s)} className="flex items-center gap-2 text-sm font-semibold text-foreground w-full">
            {showEpisodes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {episodesMeta.length} Episodes auto-filled (preview)
          </button>
          {showEpisodes && (
            <div className="space-y-2 max-h-80 overflow-y-auto border border-border rounded-lg p-3">
              {episodesMeta.map(ep => (
                <div key={ep.episodeNumber} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="relative w-20 h-12 rounded overflow-hidden bg-muted shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {ep.poster ? <img src={ep.poster} alt={ep.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">E{ep.episodeNumber}: {ep.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {ep.length && <span>{ep.length}</span>}
                      {ep.releaseDate && <span>{ep.releaseDate}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEditing ? "Updating…" : "Creating…"}</> : <>{isEditing ? "Update Season" : "Create Season"}</>}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
      </div>
    </form>
  );
}
