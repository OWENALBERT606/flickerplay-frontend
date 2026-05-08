"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, ChevronDown, ChevronUp, CheckCircle2, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createSeason, updateSeason, type Season } from "@/actions/series";
import { Dropzone, FileWithMetadata } from "@/components/ui/dropzone";
import { enrichSeasonMetadata, searchSeriesMetadata, type TmdbSeasonMeta, type TmdbEpisodeMeta, type MetadataCandidate } from "@/actions/metadata";

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
    seasonNumber:  season?.seasonNumber?.toString() || "",
    title:         season?.title         || "",
    description:   season?.description   || "",
    poster:        season?.poster        || seriesPoster || "",
    trailerUrl:    season?.trailerUrl    || "",
    releaseYear:   season?.releaseYear?.toString() || "",
  });

  /* TMDB enrichment */
  const [tmdbSeriesId, setTmdbSeriesId]     = useState("");
  const [tmdbSeriesName, setTmdbSeriesName] = useState<string | null>(null);
  const [verifying, setVerifying]           = useState(false);
  const [enriching, setEnriching]           = useState(false);
  const [metaFilled, setMetaFilled]         = useState(false);
  const [posterOptions, setPosterOptions]   = useState<string[]>([]);
  const [selectedPosterIdx, setSelectedPosterIdx] = useState(0);
  const [episodesMeta, setEpisodesMeta]     = useState<TmdbEpisodeMeta[]>([]);
  const [showEpisodes, setShowEpisodes]     = useState(false);
  const [showSearch, setShowSearch]         = useState(false);
  const [searchResults, setSearchResults]   = useState<MetadataCandidate[]>([]);
  const [searching, setSearching]           = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  /* Auto-read tmdbId from localStorage and verify it */
  useEffect(() => {
    const stored = localStorage.getItem(`series_tmdb_${seriesId}`);
    if (stored) {
      setTmdbSeriesId(stored);
      verifyTmdbId(stored);
    }
  }, [seriesId]);

  /* Verify a TMDB ID by fetching the series name */
  const verifyTmdbId = async (id: string) => {
    if (!id || isNaN(parseInt(id))) return;
    setVerifying(true);
    try {
      const res = await fetch(
        `https://moviechamp256-nodejs-api-production.up.railway.app/api/v1/metadata/enrich/series/${id}`
      );
      const data = await res.json();
      if (data?.data?.title) {
        setTmdbSeriesName(data.data.title);
      } else {
        setTmdbSeriesName(null);
      }
    } catch {
      setTmdbSeriesName(null);
    } finally {
      setVerifying(false);
    }
  };

  /* Search TMDB for the correct series */
  const handleSearch = async () => {
    if (!seriesTitle) return;
    setSearching(true);
    setShowSearch(true);
    try {
      const results = await searchSeriesMetadata(seriesTitle);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  /* Select a series from search results */
  const selectSeries = (candidate: MetadataCandidate) => {
    const id = String(candidate.tmdbId);
    setTmdbSeriesId(id);
    setTmdbSeriesName(candidate.title);
    localStorage.setItem(`series_tmdb_${seriesId}`, id);
    setShowSearch(false);
    setMetaFilled(false);
    toast.success(`Selected: ${candidate.title} (ID: ${id})`);
  };

  /* Dropzone */
  const [posterFiles, setPosterFiles]   = useState<FileWithMetadata[]>([]);
  const [trailerFiles, setTrailerFiles] = useState<FileWithMetadata[]>([]);

  const isEditing = !!season;

  useEffect(() => { if (posterFiles[0]?.publicUrl)  setFormData(p => ({ ...p, poster:     posterFiles[0].publicUrl! })); }, [posterFiles]);
  useEffect(() => { if (trailerFiles[0]?.publicUrl) setFormData(p => ({ ...p, trailerUrl: trailerFiles[0].publicUrl! })); }, [trailerFiles]);

  /* ── Fetch TMDB season metadata ── */
  const handleEnrich = async () => {
    const sNum = parseInt(formData.seasonNumber);
    const tId  = parseInt(tmdbSeriesId);

    if (!tmdbSeriesId || isNaN(tId)) {
      toast.error("Enter a valid TMDB Series ID first");
      return;
    }
    if (!formData.seasonNumber || isNaN(sNum)) {
      toast.error("Enter the season number first");
      return;
    }

    setEnriching(true);
    toast.loading("Fetching season metadata from TMDB…", { id: "season-enrich" });

    try {
      const data: TmdbSeasonMeta | null = await enrichSeasonMetadata(tId, sNum);
      if (!data) throw new Error("Season not found on TMDB");

      /* Use series fallback poster if TMDB has no season-specific poster */
      const seasonPoster = data.poster || seriesPoster || "";

      setFormData(prev => ({
        ...prev,
        title:       data.title       || prev.title,
        description: data.description || prev.description,
        poster:      seasonPoster,
        releaseYear: data.releaseYear?.toString() || prev.releaseYear,
      }));

      if (data.posterOptions.length) {
        setPosterOptions(data.posterOptions);
        setSelectedPosterIdx(0);
      }

      /* Enrich episodes — fall back to season poster → series poster if no still */
      const enrichedEpisodes = data.episodes.map(ep => ({
        ...ep,
        poster: ep.poster || seasonPoster || seriesPoster || null,
      }));
      setEpisodesMeta(enrichedEpisodes);
      setMetaFilled(true);
      setShowEpisodes(true);

      toast.success(
        `Season ${sNum} auto-filled! ${enrichedEpisodes.length} episode(s) ready.`,
        { id: "season-enrich" }
      );
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

      const result = isEditing
        ? await updateSeason(season.id, payload)
        : await createSeason(seriesId, payload);

      if (result.success) {
        toast.success(isEditing ? "Season updated!" : "Season created!");
        router.push(`/dashboard/series/${seriesId}`);
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── TMDB Auto-fill panel ── */}
      {!isEditing && (
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardContent className="pt-4 pb-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-semibold text-orange-600">Auto-fill from TMDB</p>
            </div>

            {/* ── TMDB Series ID row with verification ── */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="TMDB Series ID (e.g. 274776)"
                  value={tmdbSeriesId}
                  onChange={e => {
                    setTmdbSeriesId(e.target.value);
                    setTmdbSeriesName(null);
                    setMetaFilled(false);
                  }}
                  onBlur={() => tmdbSeriesId && verifyTmdbId(tmdbSeriesId)}
                  disabled={enriching}
                  className="text-sm font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSearch}
                  disabled={searching}
                  className="shrink-0 gap-1"
                  title={`Search TMDB for "${seriesTitle}"`}
                >
                  {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Find
                </Button>
              </div>

              {/* Verification status */}
              {verifying && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Verifying…
                </p>
              )}
              {!verifying && tmdbSeriesName && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Matched: <strong>{tmdbSeriesName}</strong>
                  {seriesTitle && tmdbSeriesName.toLowerCase() !== seriesTitle.toLowerCase() && (
                    <span className="text-yellow-500 ml-1 flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Name mismatch — verify this is correct
                    </span>
                  )}
                </p>
              )}
              {!verifying && tmdbSeriesId && !tmdbSeriesName && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Could not verify — check the ID or use Find
                </p>
              )}
            </div>

            {/* ── Search results dropdown ── */}
            {showSearch && (
              <div className="border border-border rounded-lg overflow-hidden bg-background shadow-lg">
                <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium">
                    {searching ? "Searching…" : `${searchResults.length} results for "${seriesTitle}"`}
                  </p>
                  <button onClick={() => setShowSearch(false)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                </div>
                {searchResults.map(c => (
                  <button
                    key={c.tmdbId}
                    type="button"
                    onClick={() => selectSeries(c)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left border-b border-border last:border-0"
                  >
                    <div className="w-8 h-12 rounded overflow-hidden bg-muted shrink-0">
                      {c.poster && <Image src={c.poster} alt={c.title} width={32} height={48} className="object-cover w-full h-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{c.title}</p>
                      <p className="text-xs text-muted-foreground">ID: {c.tmdbId} {c.year && `· ${c.year}`}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ── Fetch button ── */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleEnrich}
                disabled={enriching || !tmdbSeriesId || !formData.seasonNumber}
                className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
              >
                {enriching
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Fetching…</>
                  : `Fetch Season ${formData.seasonNumber || "?"} Data`
                }
              </Button>
            </div>

            {metaFilled && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Season + {episodesMeta.length} episodes auto-filled from TMDB
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
          onChange={e => {
            setFormData(p => ({ ...p, seasonNumber: e.target.value }));
            // Auto-fetch if TMDB ID is already known and a valid number is entered
            const num = parseInt(e.target.value);
            if (tmdbSeriesId && !isNaN(num) && num > 0 && !metaFilled) {
              // Small debounce — fetch after user stops typing
              setTimeout(() => handleEnrich(), 300);
            }
          }}
          required disabled={isLoading}
        />
        {tmdbSeriesId && !metaFilled && formData.seasonNumber && (
          <p className="text-xs text-orange-500">Click "Fetch Season" to auto-fill metadata</p>
        )}
      </div>

      {/* ── Title ── */}
      <div className="space-y-2">
        <Label>
          Season Title (Optional)
          {metaFilled && formData.title && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}
        </Label>
        <Input
          placeholder="e.g., The Beginning"
          value={formData.title}
          onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
          disabled={isLoading}
        />
      </div>

      {/* ── Release Year ── */}
      <div className="space-y-2">
        <Label>
          Release Year
          {metaFilled && formData.releaseYear && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}
        </Label>
        <Input
          type="number" min="1900" max="2100" placeholder="e.g., 2024"
          value={formData.releaseYear}
          onChange={e => setFormData(p => ({ ...p, releaseYear: e.target.value }))}
          disabled={isLoading}
        />
      </div>

      {/* ── Description ── */}
      <div className="space-y-2">
        <Label>
          Description
          {metaFilled && formData.description && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}
        </Label>
        <Textarea
          placeholder="Season description…" rows={3}
          value={formData.description}
          onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
          disabled={isLoading}
        />
      </div>

      {/* ── Poster picker from TMDB ── */}
      {posterOptions.length > 0 && (
        <div className="space-y-2">
          <Label>Choose Season Poster from TMDB</Label>
          <div className="flex gap-2 flex-wrap">
            {posterOptions.map((url, i) => (
              <button key={i} type="button"
                onClick={() => { setSelectedPosterIdx(i); setFormData(p => ({ ...p, poster: url })); }}
                className={`relative w-16 h-24 rounded overflow-hidden border-2 transition-all ${selectedPosterIdx === i ? "border-orange-500 scale-105" : "border-border hover:border-orange-300"}`}
              >
                <Image src={url} alt={`Poster ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Click to select. Upload below to override.</p>
        </div>
      )}

      {/* Current poster preview */}
      {formData.poster && !posterFiles.length && (
        <div className="space-y-1">
          <Label>Current Poster</Label>
          <div className="relative w-20 h-28 rounded overflow-hidden border border-border">
            <Image src={formData.poster} alt="poster" fill className="object-cover" />
          </div>
          <p className="text-xs text-muted-foreground">
            Using series poster — upload below to use a different image for this season.
          </p>
        </div>
      )}

      {/* ── Poster Upload ── */}
      <div className="space-y-2">
        <Label>Season Poster (Optional — upload to override)</Label>
        <Dropzone provider="cloudflare-r2" variant="compact" maxFiles={1} maxSize={1024*1024*5}
          accept={{ "image/*": [".png",".jpg",".jpeg",".webp"] }} onFilesChange={setPosterFiles} disabled={isLoading} />
      </div>

      {/* ── Trailer Upload ── */}
      <div className="space-y-2">
        <Label>Season Trailer (Optional)</Label>
        <Dropzone provider="cloudflare-r2" variant="compact" maxFiles={1} maxSize={1024*1024*100}
          accept={{ "video/*": [".mp4",".mov",".avi",".mkv"] }} onFilesChange={setTrailerFiles} disabled={isLoading} />
      </div>

      {/* ── Episode preview ── */}
      {episodesMeta.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowEpisodes(s => !s)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground w-full"
          >
            {showEpisodes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {episodesMeta.length} Episodes auto-filled (preview)
          </button>

          {showEpisodes && (
            <div className="space-y-2 max-h-80 overflow-y-auto border border-border rounded-lg p-3">
              {episodesMeta.map(ep => (
                <div key={ep.episodeNumber} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="relative w-20 h-12 rounded overflow-hidden bg-muted shrink-0">
                    {ep.poster
                      ? <Image src={ep.poster} alt={ep.title} fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">
                      E{ep.episodeNumber}: {ep.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {ep.length && <span>{ep.length}</span>}
                      {ep.releaseDate && <span>{ep.releaseDate}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            These episode details will be available when you add individual episodes.
            Copy the TMDB Series ID and use it in each episode form to auto-fill.
          </p>
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
