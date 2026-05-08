"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createEpisode, updateEpisode, type Episode } from "@/actions/series";
import { Dropzone, FileWithMetadata } from "@/components/ui/dropzone";
import { VideoDropzone } from "@/components/ui/video-dropzone";
import {
  enrichEpisodeMetadata,
  searchSeriesMetadata,
  type TmdbEpisodeFullMeta,
  type MetadataCandidate,
} from "@/actions/metadata";

interface EpisodeFormProps {
  seriesId: string;
  seasonId: string;
  episode?: Episode;
  seasonNumber?: number;
  seriesPoster?: string;
  seriesTitle?: string;
}

export function EpisodeForm({ seriesId, seasonId, episode, seasonNumber = 1, seriesPoster, seriesTitle }: EpisodeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    episodeNumber: episode?.episodeNumber?.toString() || "",
    title:         episode?.title         || "",
    description:   episode?.description   || "",
    videoUrl:      episode?.videoUrl      || "",
    poster:        episode?.poster        || seriesPoster || "",
    length:        episode?.length        || "",
    lengthSeconds: episode?.lengthSeconds?.toString() || "",
    size:          episode?.size          || "",
    releaseDate:   episode?.releaseDate ? new Date(episode.releaseDate).toISOString().split("T")[0] : "",
  });

  /* ── TMDB state ── */
  const [tmdbSeriesId, setTmdbSeriesId]     = useState<number | null>(null);
  const [confirmedTitle, setConfirmedTitle] = useState<string | null>(null);
  const [candidates, setCandidates]         = useState<MetadataCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [enriching, setEnriching]           = useState(false);
  const [metaFilled, setMetaFilled]         = useState(false);
  const [stillOptions, setStillOptions]     = useState<string[]>([]);
  const [selectedStillIdx, setSelectedStillIdx] = useState(0);
  const [director, setDirector]             = useState<string | null>(null);

  /* Dropzone */
  const [posterFiles, setPosterFiles] = useState<FileWithMetadata[]>([]);
  const isEditing = !!episode;

  useEffect(() => { if (posterFiles[0]?.publicUrl) setFormData(p => ({ ...p, poster: posterFiles[0].publicUrl! })); }, [posterFiles]);

  /* ── Auto-search TMDB on mount using series title ── */
  useEffect(() => {
    if (!seriesTitle || isEditing) return;

    // Check localStorage first
    const stored = localStorage.getItem(`series_tmdb_${seriesId}`);
    if (stored) {
      const storedName = localStorage.getItem(`series_tmdb_name_${seriesId}`);
      setTmdbSeriesId(parseInt(stored));
      setConfirmedTitle(storedName || seriesTitle);
      return;
    }

    setLoadingCandidates(true);
    searchSeriesMetadata(seriesTitle).then(results => {
      setCandidates(results);
      const exact = results.find(r => r.title.toLowerCase() === seriesTitle.toLowerCase());
      if (exact) {
        setTmdbSeriesId(exact.tmdbId);
        setConfirmedTitle(exact.title);
        localStorage.setItem(`series_tmdb_${seriesId}`, String(exact.tmdbId));
        localStorage.setItem(`series_tmdb_name_${seriesId}`, exact.title);
      }
    }).catch(() => {}).finally(() => setLoadingCandidates(false));
  }, [seriesTitle, seriesId, isEditing]);

  /* ── Select a candidate ── */
  const selectCandidate = (c: MetadataCandidate) => {
    setTmdbSeriesId(c.tmdbId);
    setConfirmedTitle(c.title);
    localStorage.setItem(`series_tmdb_${seriesId}`, String(c.tmdbId));
    localStorage.setItem(`series_tmdb_name_${seriesId}`, c.title);
    setCandidates([]);
    setMetaFilled(false);
    toast.success(`Using: ${c.title}`);
  };

  /* ── Fetch episode metadata ── */
  const handleEnrich = async () => {
    const epNum = parseInt(formData.episodeNumber);
    if (!tmdbSeriesId) { toast.error("Select the correct series from TMDB first"); return; }
    if (!formData.episodeNumber || isNaN(epNum)) { toast.error("Enter the episode number first"); return; }

    setEnriching(true);
    toast.loading(`Fetching S${seasonNumber}E${epNum} of "${confirmedTitle}"…`, { id: "ep-enrich" });

    try {
      const data: TmdbEpisodeFullMeta | null = await enrichEpisodeMetadata(tmdbSeriesId, seasonNumber, epNum);
      if (!data) throw new Error(`Episode not found on TMDB`);

      const poster = data.poster || seriesPoster || "";
      setFormData(prev => ({
        ...prev,
        title:         data.title         || prev.title,
        description:   data.description   || prev.description,
        poster,
        length:        data.length        || prev.length,
        lengthSeconds: data.lengthSeconds?.toString() || prev.lengthSeconds,
        releaseDate:   data.releaseDate   || prev.releaseDate,
      }));

      if (data.stillOptions.length) { setStillOptions(data.stillOptions); setSelectedStillIdx(0); }
      if (data.director) setDirector(data.director);
      setMetaFilled(true);
      toast.success(`Episode ${epNum} auto-filled!`, { id: "ep-enrich" });
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch episode metadata", { id: "ep-enrich" });
    } finally {
      setEnriching(false);
    }
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.episodeNumber || !formData.title || !formData.videoUrl) {
      toast.error("Episode number, title, and video are required"); return;
    }
    setIsLoading(true);
    try {
      const payload = {
        episodeNumber: parseInt(formData.episodeNumber),
        title:         formData.title,
        description:   formData.description || undefined,
        videoUrl:      formData.videoUrl,
        poster:        formData.poster      || undefined,
        length:        formData.length      || undefined,
        lengthSeconds: formData.lengthSeconds ? parseInt(formData.lengthSeconds) : undefined,
        size:          formData.size        || undefined,
        releaseDate:   formData.releaseDate || undefined,
      };
      const result = isEditing ? await updateEpisode(episode.id, payload) : await createEpisode(seasonId, payload);
      if (result.success) {
        toast.success(isEditing ? "Episode updated!" : "Episode created!");
        router.push(`/dashboard/series/${seriesId}/seasons/${seasonId}`);
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch { toast.error("An unexpected error occurred"); }
    finally { setIsLoading(false); }
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
              {seasonNumber && <Badge variant="secondary" className="text-xs">Season {seasonNumber}</Badge>}
            </div>

            {loadingCandidates && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Searching TMDB for "{seriesTitle}"…
              </div>
            )}

            {/* Confirmed series */}
            {tmdbSeriesId && confirmedTitle && !loadingCandidates && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-700 line-clamp-1">{confirmedTitle}</p>
                  <p className="text-[10px] text-muted-foreground">Season {seasonNumber} · TMDB ID: {tmdbSeriesId}</p>
                </div>
                <button type="button" onClick={() => { setTmdbSeriesId(null); setConfirmedTitle(null); setMetaFilled(false); }} className="text-xs text-muted-foreground hover:text-foreground underline shrink-0">Change</button>
              </div>
            )}

            {/* Candidate picker */}
            {!tmdbSeriesId && !loadingCandidates && candidates.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Select the correct series:</p>
                <div className="max-h-52 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                  {candidates.map(c => (
                    <button key={c.tmdbId} type="button" onClick={() => selectCandidate(c)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left">
                      <div className="w-8 h-12 rounded overflow-hidden bg-muted shrink-0">
                        {c.poster && <Image src={c.poster} alt={c.title} width={32} height={48} className="object-cover w-full h-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.year && `${c.year} · `}ID: {c.tmdbId}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!tmdbSeriesId && !loadingCandidates && candidates.length === 0 && seriesTitle && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-3.5 h-3.5" />
                No TMDB results. Enter episode number and fetch manually.
              </div>
            )}

            {/* Fetch button */}
            {tmdbSeriesId && (
              <Button type="button" onClick={handleEnrich} disabled={enriching || !formData.episodeNumber} className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                {enriching
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Fetching S{seasonNumber}E{formData.episodeNumber}…</>
                  : `Fetch Episode ${formData.episodeNumber || "?"} Data (S${seasonNumber})`
                }
              </Button>
            )}

            {metaFilled && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Episode auto-filled
                {director && <span className="text-muted-foreground">· Director: {director}</span>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Episode Number / Release Date ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Episode Number <span className="text-destructive">*</span></Label>
          <Input type="number" min="1" placeholder="e.g., 1" value={formData.episodeNumber} onChange={e => { setFormData(p => ({ ...p, episodeNumber: e.target.value })); setMetaFilled(false); }} required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label>Release Date {metaFilled && formData.releaseDate && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}</Label>
          <Input type="date" value={formData.releaseDate} onChange={e => setFormData(p => ({ ...p, releaseDate: e.target.value }))} disabled={isLoading} />
        </div>
      </div>

      {/* ── Title ── */}
      <div className="space-y-2">
        <Label>Episode Title <span className="text-destructive">*</span> {metaFilled && formData.title && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}</Label>
        <Input placeholder="e.g., Pilot" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required disabled={isLoading} />
      </div>

      {/* ── Description ── */}
      <div className="space-y-2">
        <Label>Description {metaFilled && formData.description && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}</Label>
        <Textarea placeholder="Episode description…" rows={3} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} disabled={isLoading} />
      </div>

      {/* ── Duration ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duration {metaFilled && formData.length && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}</Label>
          <Input placeholder="e.g., 58m" value={formData.length} onChange={e => setFormData(p => ({ ...p, length: e.target.value }))} disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label>File Size</Label>
          <Input placeholder="e.g., 1.2 GB" value={formData.size} onChange={e => setFormData(p => ({ ...p, size: e.target.value }))} disabled={isLoading} />
        </div>
      </div>

      {/* ── Still picker ── */}
      {stillOptions.length > 0 && (
        <div className="space-y-2">
          <Label>Choose Episode Thumbnail from TMDB</Label>
          <div className="flex gap-2 flex-wrap">
            {stillOptions.map((url, i) => (
              <button key={i} type="button" onClick={() => { setSelectedStillIdx(i); setFormData(p => ({ ...p, poster: url })); }} className={`relative w-28 h-16 rounded overflow-hidden border-2 transition-all ${selectedStillIdx === i ? "border-orange-500 scale-105" : "border-border hover:border-orange-300"}`}>
                <Image src={url} alt={`Still ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current poster */}
      {formData.poster && !posterFiles.length && (
        <div className="space-y-1">
          <Label>Current Thumbnail</Label>
          <div className="relative w-32 h-20 rounded overflow-hidden border border-border">
            <Image src={formData.poster} alt="thumbnail" fill className="object-cover" />
          </div>
          <p className="text-xs text-muted-foreground">Upload below to override</p>
        </div>
      )}

      {/* ── Poster Upload ── */}
      <div className="space-y-2">
        <Label>Episode Thumbnail (Optional)</Label>
        <Dropzone provider="cloudflare-r2" variant="compact" maxFiles={1} maxSize={1024*1024*5} accept={{ "image/*": [".png",".jpg",".jpeg",".webp"] }} onFilesChange={setPosterFiles} disabled={isLoading} />
      </div>

      {/* ── Video Upload ── */}
      <div className="space-y-2">
        <Label>Episode Video <span className="text-destructive">*</span></Label>
        <VideoDropzone onFilesChange={files => { if (files[0]?.publicUrl) setFormData(p => ({ ...p, videoUrl: files[0].publicUrl! })); }} disabled={isLoading} />
        <p className="text-xs text-muted-foreground">Compressed to 1080p before uploading.</p>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEditing ? "Updating…" : "Creating…"}</> : <>{isEditing ? "Update Episode" : "Create Episode"}</>}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
      </div>
    </form>
  );
}
