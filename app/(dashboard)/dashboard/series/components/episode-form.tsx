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
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createEpisode, updateEpisode, type Episode } from "@/actions/series";
import { Dropzone, FileWithMetadata } from "@/components/ui/dropzone";
import { VideoDropzone } from "@/components/ui/video-dropzone";
import { enrichEpisodeMetadata, type TmdbEpisodeFullMeta } from "@/actions/metadata";

interface EpisodeFormProps {
  seriesId: string;
  seasonId: string;
  episode?: Episode;
  /** Season number — needed for TMDB lookup */
  seasonNumber?: number;
  /** Series fallback poster */
  seriesPoster?: string;
}

export function EpisodeForm({ seriesId, seasonId, episode, seasonNumber, seriesPoster }: EpisodeFormProps) {
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
    releaseDate:   episode?.releaseDate
      ? new Date(episode.releaseDate).toISOString().split("T")[0]
      : "",
  });

  /* TMDB enrichment */
  const [tmdbSeriesId, setTmdbSeriesId] = useState("");
  const [enriching, setEnriching]       = useState(false);
  const [metaFilled, setMetaFilled]     = useState(false);
  const [stillOptions, setStillOptions] = useState<string[]>([]);
  const [selectedStillIdx, setSelectedStillIdx] = useState(0);
  const [director, setDirector]         = useState<string | null>(null);

  /* Auto-read tmdbId from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem(`series_tmdb_${seriesId}`);
    if (stored) setTmdbSeriesId(stored);
  }, [seriesId]);

  /* Dropzone */
  const [posterFiles, setPosterFiles] = useState<FileWithMetadata[]>([]);

  const isEditing = !!episode;

  useEffect(() => { if (posterFiles[0]?.publicUrl) setFormData(p => ({ ...p, poster: posterFiles[0].publicUrl! })); }, [posterFiles]);

  /* ── Fetch TMDB episode metadata ── */
  const handleEnrich = async () => {
    const epNum = parseInt(formData.episodeNumber);
    const sNum  = seasonNumber || 1;
    const tId   = parseInt(tmdbSeriesId);

    if (!tmdbSeriesId || isNaN(tId)) { toast.error("Enter a valid TMDB Series ID"); return; }
    if (!formData.episodeNumber || isNaN(epNum)) { toast.error("Enter the episode number first"); return; }

    setEnriching(true);
    toast.loading("Fetching episode metadata from TMDB…", { id: "ep-enrich" });

    try {
      const data: TmdbEpisodeFullMeta | null = await enrichEpisodeMetadata(tId, sNum, epNum);
      if (!data) throw new Error("Episode not found on TMDB");

      /* Fall back to series poster if no episode still */
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

      if (data.stillOptions.length) {
        setStillOptions(data.stillOptions);
        setSelectedStillIdx(0);
      }
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
      toast.error("Episode number, title, and video are required");
      return;
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

      const result = isEditing
        ? await updateEpisode(episode.id, payload)
        : await createEpisode(seasonId, payload);

      if (result.success) {
        toast.success(isEditing ? "Episode updated!" : "Episode created!");
        router.push(`/dashboard/series/${seriesId}/seasons/${seasonId}`);
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
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-semibold text-orange-600">Auto-fill from TMDB</p>
              {tmdbSeriesId && (
                <span className="ml-auto text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  TMDB ID: {tmdbSeriesId}
                </span>
              )}
            </div>

            {!tmdbSeriesId ? (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  Enter the TMDB Series ID and episode number to auto-fill metadata.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="TMDB Series ID (e.g. 1396)"
                    value={tmdbSeriesId}
                    onChange={e => setTmdbSeriesId(e.target.value)}
                    disabled={enriching}
                    className="text-sm flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleEnrich}
                    disabled={enriching || !tmdbSeriesId || !formData.episodeNumber}
                    className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                  >
                    {enriching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  Enter the episode number and click Fetch — TMDB ID is already saved.
                </p>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
                    <span>Series ID: <strong className="text-foreground">{tmdbSeriesId}</strong></span>
                    <button
                      type="button"
                      onClick={() => setTmdbSeriesId("")}
                      className="ml-auto text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Change
                    </button>
                  </div>
                  <Button
                    type="button"
                    onClick={handleEnrich}
                    disabled={enriching || !formData.episodeNumber}
                    className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                  >
                    {enriching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch Episode"}
                  </Button>
                </div>
              </>
            )}

            {metaFilled && (
              <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Episode auto-filled from TMDB
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
          <Input type="number" min="1" placeholder="e.g., 1"
            value={formData.episodeNumber}
            onChange={e => setFormData(p => ({ ...p, episodeNumber: e.target.value }))}
            required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label>
            Release Date
            {metaFilled && formData.releaseDate && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}
          </Label>
          <Input type="date"
            value={formData.releaseDate}
            onChange={e => setFormData(p => ({ ...p, releaseDate: e.target.value }))}
            disabled={isLoading} />
        </div>
      </div>

      {/* ── Title ── */}
      <div className="space-y-2">
        <Label>
          Episode Title <span className="text-destructive">*</span>
          {metaFilled && formData.title && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}
        </Label>
        <Input placeholder="e.g., Pilot"
          value={formData.title}
          onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
          required disabled={isLoading} />
      </div>

      {/* ── Description ── */}
      <div className="space-y-2">
        <Label>
          Description
          {metaFilled && formData.description && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}
        </Label>
        <Textarea placeholder="Episode description…" rows={3}
          value={formData.description}
          onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
          disabled={isLoading} />
      </div>

      {/* ── Duration ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Duration
            {metaFilled && formData.length && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}
          </Label>
          <Input placeholder="e.g., 58m"
            value={formData.length}
            onChange={e => setFormData(p => ({ ...p, length: e.target.value }))}
            disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label>File Size</Label>
          <Input placeholder="e.g., 1.2 GB"
            value={formData.size}
            onChange={e => setFormData(p => ({ ...p, size: e.target.value }))}
            disabled={isLoading} />
        </div>
      </div>

      {/* ── Still image picker from TMDB ── */}
      {stillOptions.length > 0 && (
        <div className="space-y-2">
          <Label>Choose Episode Thumbnail from TMDB</Label>
          <div className="flex gap-2 flex-wrap">
            {stillOptions.map((url, i) => (
              <button key={i} type="button"
                onClick={() => { setSelectedStillIdx(i); setFormData(p => ({ ...p, poster: url })); }}
                className={`relative w-28 h-16 rounded overflow-hidden border-2 transition-all ${selectedStillIdx === i ? "border-orange-500 scale-105" : "border-border hover:border-orange-300"}`}
              >
                <Image src={url} alt={`Still ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Click to select. Upload below to override.</p>
        </div>
      )}

      {/* Current poster preview */}
      {formData.poster && !posterFiles.length && (
        <div className="space-y-1">
          <Label>Current Thumbnail</Label>
          <div className="relative w-32 h-20 rounded overflow-hidden border border-border">
            <Image src={formData.poster} alt="thumbnail" fill className="object-cover" />
          </div>
          <p className="text-xs text-muted-foreground">
            Using series poster — upload below to use a different image for this episode.
          </p>
        </div>
      )}

      {/* ── Poster Upload ── */}
      <div className="space-y-2">
        <Label>Episode Thumbnail (Optional — upload to override)</Label>
        <Dropzone provider="cloudflare-r2" variant="compact" maxFiles={1} maxSize={1024*1024*5}
          accept={{ "image/*": [".png",".jpg",".jpeg",".webp"] }} onFilesChange={setPosterFiles} disabled={isLoading} />
      </div>

      {/* ── Video Upload — compressed to 1080p ── */}
      <div className="space-y-2">
        <Label>Episode Video <span className="text-destructive">*</span></Label>
        <VideoDropzone
          onFilesChange={(files) => {
            if (files[0]?.publicUrl) setFormData(p => ({ ...p, videoUrl: files[0].publicUrl! }));
          }}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Compressed to 1080p in your browser before uploading.
        </p>
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
