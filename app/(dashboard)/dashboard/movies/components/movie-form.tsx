"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createMovie, updateMovie, type Movie } from "@/actions/movies";
import { listVJs } from "@/actions/vjs";
import { listGenres } from "@/actions/genres";
import { listReleaseYears } from "@/actions/releaseYear";
import { Dropzone, FileWithMetadata } from "@/components/ui/dropzone";
import { MetadataTitleSearch } from "@/components/dashboard/metadata-title-search";
import {
  searchMovieMetadata,
  enrichMovieMetadata,
  type EnrichedMovie,
} from "@/actions/metadata";
import Image from "next/image";

interface MovieFormProps {
  movie?: Movie;
}

export function MovieForm({ movie }: MovieFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title:         movie?.title         || "",
    image:         movie?.image         || "",
    poster:        movie?.poster        || "",
    trailerPoster: movie?.trailerPoster || "",
    rating:        movie?.rating?.toString() || "0",
    vjId:          movie?.vjId          || "",
    genreId:       movie?.genreId       || "",
    yearId:        movie?.yearId        || "",
    size:          movie?.size          || "",
    sizeBytes:     movie?.sizeBytes?.toString() || "",
    length:        movie?.length        || "",
    lengthSeconds: movie?.lengthSeconds?.toString() || "",
    description:   movie?.description   || "",
    director:      movie?.director      || "",
    cast:          movie?.cast?.join(", ") || "",
    trailerUrl:    movie?.trailerUrl    || "",
    videoUrl:      movie?.videoUrl      || "",
    isComingSoon:  movie?.isComingSoon  || false,
    isTrending:    movie?.isTrending    || false,
  });

  /* Metadata enrichment state */
  const [metaFilled, setMetaFilled]           = useState(false);
  const [posterOptions, setPosterOptions]     = useState<string[]>([]);
  const [selectedPosterIdx, setSelectedPosterIdx] = useState(0);
  const [metaSource, setMetaSource]           = useState<string | null>(null);

  /* Dropzone state */
  const [imageFiles, setImageFiles]               = useState<FileWithMetadata[]>([]);
  const [posterFiles, setPosterFiles]             = useState<FileWithMetadata[]>([]);
  const [trailerPosterFiles, setTrailerPosterFiles] = useState<FileWithMetadata[]>([]);
  const [trailerFiles, setTrailerFiles]           = useState<FileWithMetadata[]>([]);
  const [videoFiles, setVideoFiles]               = useState<FileWithMetadata[]>([]);

  /* Select options */
  const [vjs, setVjs]       = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [years, setYears]   = useState<any[]>([]);

  const isEditing = !!movie;

  useEffect(() => {
    async function loadOptions() {
      const [vjsData, genresData, yearsData] = await Promise.all([
        listVJs(), listGenres(), listReleaseYears(),
      ]);
      if (vjsData.success)    setVjs(vjsData.data || []);
      if (genresData.success) setGenres(genresData.data || []);
      if (yearsData.success)  setYears(yearsData.data || []);
    }
    loadOptions();
  }, []);

  /* Sync uploaded files → formData */
  useEffect(() => { if (imageFiles[0]?.publicUrl)         setFormData(p => ({ ...p, image:         imageFiles[0].publicUrl! })); }, [imageFiles]);
  useEffect(() => { if (posterFiles[0]?.publicUrl)        setFormData(p => ({ ...p, poster:        posterFiles[0].publicUrl! })); }, [posterFiles]);
  useEffect(() => { if (trailerPosterFiles[0]?.publicUrl) setFormData(p => ({ ...p, trailerPoster: trailerPosterFiles[0].publicUrl! })); }, [trailerPosterFiles]);
  useEffect(() => { if (trailerFiles[0]?.publicUrl)       setFormData(p => ({ ...p, trailerUrl:    trailerFiles[0].publicUrl! })); }, [trailerFiles]);
  useEffect(() => { if (videoFiles[0]?.publicUrl)         setFormData(p => ({ ...p, videoUrl:      videoFiles[0].publicUrl! })); }, [videoFiles]);

  /* ── Auto-fill from metadata ── */
  const handleMetadataSelect = async (tmdbId: number) => {
    const data: EnrichedMovie | null = await enrichMovieMetadata(tmdbId);
    if (!data) throw new Error("No metadata returned");

    /* Reload genres/years in case new ones were created by the enrichment service */
    const [genresData, yearsData] = await Promise.all([listGenres(), listReleaseYears()]);
    if (genresData.success) setGenres(genresData.data || []);
    if (yearsData.success)  setYears(yearsData.data || []);

    setFormData(prev => ({
      ...prev,
      title:         data.title         || prev.title,
      description:   data.description   || prev.description,
      poster:        data.poster        || prev.poster,
      image:         data.image         || prev.image,
      trailerPoster: data.trailerPoster || prev.trailerPoster,
      director:      data.director      || prev.director,
      cast:          data.cast?.join(", ") || prev.cast,
      rating:        data.rating?.toString() || prev.rating,
      length:        data.length        || prev.length,
      lengthSeconds: data.lengthSeconds?.toString() || prev.lengthSeconds,
      trailerUrl:    data.trailerUrl    || prev.trailerUrl,
      isTrending:    data.isTrending    ?? prev.isTrending,
      isComingSoon:  data.isComingSoon  ?? prev.isComingSoon,
      genreId:       data.genreId       || prev.genreId,
      yearId:        data.yearId        || prev.yearId,
      /* videoUrl, vjId, size, sizeBytes — never auto-filled */
    }));

    if (data._meta?.posterOptions?.length) {
      setPosterOptions(data._meta.posterOptions);
      setSelectedPosterIdx(0);
    }
    setMetaSource(data._meta?.ratingSource || null);
    setMetaFilled(true);
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error("Movie title is required"); return; }
    if (!formData.vjId || !formData.genreId || !formData.yearId) {
      toast.error("Please select VJ, Genre, and Year"); return;
    }

    setIsLoading(true);
    try {
      const castArray = formData.cast.split(",").map(c => c.trim()).filter(Boolean);
      const payload = {
        title:         formData.title,
        image:         formData.image,
        poster:        formData.poster,
        trailerPoster: formData.trailerPoster,
        rating:        parseFloat(formData.rating) || 0,
        vjId:          formData.vjId,
        genreId:       formData.genreId,
        yearId:        formData.yearId,
        size:          formData.size,
        sizeBytes:     formData.sizeBytes ? parseInt(formData.sizeBytes) : undefined,
        length:        formData.length,
        lengthSeconds: formData.lengthSeconds ? parseInt(formData.lengthSeconds) : undefined,
        description:   formData.description,
        director:      formData.director,
        cast:          castArray,
        trailerUrl:    formData.trailerUrl,
        videoUrl:      formData.videoUrl,
        isComingSoon:  formData.isComingSoon,
        isTrending:    formData.isTrending,
      };

      const result = isEditing
        ? await updateMovie(movie.id, payload)
        : await createMovie(payload);

      if (result.success) {
        toast.success(isEditing ? "Movie updated!" : "Movie created!");
        router.push("/dashboard/movies");
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Metadata auto-fill banner ── */}
      {metaFilled && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm text-orange-600">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>
            Form auto-filled from TMDB
            {metaSource && <> · Rating from <strong>{metaSource.toUpperCase()}</strong></>}.
            Review and adjust before saving.
          </span>
          <button type="button" onClick={() => setMetaFilled(false)} className="ml-auto text-orange-400 hover:text-orange-600 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Title with TMDB search ── */}
      <MetadataTitleSearch
        value={formData.title}
        onChange={(v) => setFormData(p => ({ ...p, title: v }))}
        onSearch={searchMovieMetadata}
        onSelect={handleMetadataSelect}
        disabled={isLoading}
        label="Movie Title"
        placeholder="e.g., Inception — type to search TMDB"
      />

      {/* ── Poster picker (from TMDB options) ── */}
      {posterOptions.length > 0 && (
        <div className="space-y-2">
          <Label>Choose Poster from TMDB</Label>
          <div className="flex gap-2 flex-wrap">
            {posterOptions.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedPosterIdx(i);
                  setFormData(p => ({ ...p, poster: url, trailerPoster: url }));
                }}
                className={`relative w-16 h-24 rounded overflow-hidden border-2 transition-all ${
                  selectedPosterIdx === i ? "border-orange-500 scale-105" : "border-border hover:border-orange-300"
                }`}
              >
                <Image src={url} alt={`Poster ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Click a poster to use it. You can still upload your own below.</p>
        </div>
      )}

      {/* ── Image Upload ── */}
      <div className="space-y-2">
        <Label>Movie Image {formData.image && <Badge variant="secondary" className="ml-2 text-xs">✓ Set</Badge>}</Label>
        {formData.image && !imageFiles.length && (
          <div className="relative w-32 h-20 rounded overflow-hidden border border-border mb-2">
            <Image src={formData.image} alt="image" fill className="object-cover" />
          </div>
        )}
        <Dropzone provider="cloudflare-r2" variant="compact" maxFiles={1} maxSize={1024*1024*5}
          accept={{ "image/*": [".png",".jpg",".jpeg",".webp"] }} onFilesChange={setImageFiles} disabled={isLoading} />
        <p className="text-xs text-muted-foreground">Main movie image (max 5MB)</p>
      </div>

      {/* ── Poster Upload ── */}
      <div className="space-y-2">
        <Label>Movie Poster {formData.poster && <Badge variant="secondary" className="ml-2 text-xs">✓ Set</Badge>}</Label>
        {formData.poster && !posterFiles.length && (
          <div className="relative w-20 h-28 rounded overflow-hidden border border-border mb-2">
            <Image src={formData.poster} alt="poster" fill className="object-cover" />
          </div>
        )}
        <Dropzone provider="cloudflare-r2" variant="compact" maxFiles={1} maxSize={1024*1024*5}
          accept={{ "image/*": [".png",".jpg",".jpeg",".webp"] }} onFilesChange={setPosterFiles} disabled={isLoading} />
        <p className="text-xs text-muted-foreground">Movie poster (max 5MB)</p>
      </div>

      {/* ── Trailer Poster Upload ── */}
      <div className="space-y-2">
        <Label>Trailer Poster {formData.trailerPoster && <Badge variant="secondary" className="ml-2 text-xs">✓ Set</Badge>}</Label>
        {formData.trailerPoster && !trailerPosterFiles.length && (
          <div className="relative w-32 h-20 rounded overflow-hidden border border-border mb-2">
            <Image src={formData.trailerPoster} alt="trailer poster" fill className="object-cover" />
          </div>
        )}
        <Dropzone provider="cloudflare-r2" variant="compact" maxFiles={1} maxSize={1024*1024*5}
          accept={{ "image/*": [".png",".jpg",".jpeg",".webp"] }} onFilesChange={setTrailerPosterFiles} disabled={isLoading} />
        <p className="text-xs text-muted-foreground">Trailer thumbnail (max 5MB)</p>
      </div>

      {/* ── VJ / Genre / Year ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>VJ <span className="text-destructive">*</span></Label>
          <Select value={formData.vjId} onValueChange={v => setFormData(p => ({ ...p, vjId: v }))} disabled={isLoading}>
            <SelectTrigger><SelectValue placeholder="Select VJ" /></SelectTrigger>
            <SelectContent>{vjs.map(vj => <SelectItem key={vj.id} value={vj.id}>{vj.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Genre <span className="text-destructive">*</span>
            {formData.genreId && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}
          </Label>
          <Select value={formData.genreId} onValueChange={v => setFormData(p => ({ ...p, genreId: v }))} disabled={isLoading}>
            <SelectTrigger><SelectValue placeholder="Select Genre" /></SelectTrigger>
            <SelectContent>{genres.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Year <span className="text-destructive">*</span>
            {formData.yearId && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}
          </Label>
          <Select value={formData.yearId} onValueChange={v => setFormData(p => ({ ...p, yearId: v }))} disabled={isLoading}>
            <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
            <SelectContent>{years.map(y => <SelectItem key={y.id} value={y.id}>{y.value}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Rating / Director ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Rating (0–10)</Label>
          <Input type="number" step="0.1" min="0" max="10" placeholder="e.g., 8.5"
            value={formData.rating} onChange={e => setFormData(p => ({ ...p, rating: e.target.value }))} disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label>Director</Label>
          <Input type="text" placeholder="e.g., Christopher Nolan"
            value={formData.director} onChange={e => setFormData(p => ({ ...p, director: e.target.value }))} disabled={isLoading} />
        </div>
      </div>

      {/* ── Size / Length ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>File Size</Label>
          <Input type="text" placeholder="e.g., 2.5 GB"
            value={formData.size} onChange={e => setFormData(p => ({ ...p, size: e.target.value }))} disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label>Duration {formData.length && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}</Label>
          <Input type="text" placeholder="e.g., 2h 30m"
            value={formData.length} onChange={e => setFormData(p => ({ ...p, length: e.target.value }))} disabled={isLoading} />
        </div>
      </div>

      {/* ── Cast ── */}
      <div className="space-y-2">
        <Label>Cast (comma-separated)</Label>
        <Input type="text" placeholder="e.g., Leonardo DiCaprio, Joseph Gordon-Levitt"
          value={formData.cast} onChange={e => setFormData(p => ({ ...p, cast: e.target.value }))} disabled={isLoading} />
      </div>

      {/* ── Description ── */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea placeholder="Movie description…" rows={4}
          value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} disabled={isLoading} />
      </div>

      {/* ── Trailer URL (auto-filled or manual) ── */}
      <div className="space-y-2">
        <Label>
          Trailer URL
          {formData.trailerUrl && <Badge variant="secondary" className="ml-2 text-xs">✓ Auto</Badge>}
        </Label>
        <Input type="url" placeholder="https://youtube.com/watch?v=..."
          value={formData.trailerUrl} onChange={e => setFormData(p => ({ ...p, trailerUrl: e.target.value }))} disabled={isLoading} />
        <p className="text-xs text-muted-foreground">Auto-filled from YouTube/TMDB if found. You can override.</p>
      </div>

      {/* ── Trailer Video Upload ── */}
      <div className="space-y-2">
        <Label>Trailer Video File (optional)</Label>
        <Dropzone provider="cloudflare-r2" variant="compact" maxFiles={1} maxSize={1024*1024*100}
          accept={{ "video/*": [".mp4",".mov",".avi",".mkv"] }} onFilesChange={setTrailerFiles} disabled={isLoading} />
        <p className="text-xs text-muted-foreground">Upload trailer video (max 100MB) — overrides URL above</p>
      </div>

      {/* ── Full Movie Video ── */}
      <div className="space-y-2">
        <Label>Full Movie Video <span className="text-destructive">*</span></Label>
        <Dropzone provider="cloudflare-r2" variant="compact" maxFiles={1} maxSize={1024*1024*1024*5}
          accept={{ "video/*": [".mp4",".mov",".avi",".mkv"] }} onFilesChange={setVideoFiles} disabled={isLoading} />
        <p className="text-xs text-muted-foreground">Full movie video (max 5GB) — required</p>
      </div>

      {/* ── Checkboxes ── */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Checkbox id="isTrending" checked={formData.isTrending}
            onCheckedChange={v => setFormData(p => ({ ...p, isTrending: v as boolean }))} disabled={isLoading} />
          <Label htmlFor="isTrending" className="cursor-pointer">Mark as Trending</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="isComingSoon" checked={formData.isComingSoon}
            onCheckedChange={v => setFormData(p => ({ ...p, isComingSoon: v as boolean }))} disabled={isLoading} />
          <Label htmlFor="isComingSoon" className="cursor-pointer">Mark as Coming Soon</Label>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEditing ? "Updating…" : "Creating…"}</> : <>{isEditing ? "Update Movie" : "Create Movie"}</>}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
      </div>
    </form>
  );
}
