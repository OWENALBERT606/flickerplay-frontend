"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, Search, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { MetadataCandidate } from "@/actions/metadata";

interface MetadataTitleSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (title: string) => Promise<MetadataCandidate[]>;
  onSelect: (tmdbId: number) => Promise<void>;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export function MetadataTitleSearch({
  value,
  onChange,
  onSearch,
  onSelect,
  disabled,
  label = "Title",
  placeholder = "e.g., Inception",
}: MetadataTitleSearchProps) {
  const [candidates, setCandidates] = useState<MetadataCandidate[]>([]);
  const [searching, setSearching]   = useState(false);
  const [enriching, setEnriching]   = useState(false);
  const [open, setOpen]             = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Debounced search — fires 600ms after user stops typing */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onChange(val);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (val.trim().length < 2) {
        setCandidates([]);
        setOpen(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setSearching(true);
        try {
          const results = await onSearch(val.trim());
          setCandidates(results);
          setOpen(results.length > 0);
        } catch {
          setCandidates([]);
        } finally {
          setSearching(false);
        }
      }, 600);
    },
    [onChange, onSearch]
  );

  /* Pick a candidate → enrich → auto-fill */
  const handleSelect = async (candidate: MetadataCandidate) => {
    setOpen(false);
    onChange(candidate.title);
    setEnriching(true);
    toast.loading("Fetching metadata…", { id: "enrich" });

    try {
      await onSelect(candidate.tmdbId);
      toast.success("Form auto-filled from metadata!", { id: "enrich" });
    } catch {
      toast.error("Failed to fetch metadata", { id: "enrich" });
    } finally {
      setEnriching(false);
    }
  };

  const clearSearch = () => {
    onChange("");
    setCandidates([]);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="title">
          {label} <span className="text-destructive">*</span>
        </Label>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3 text-orange-500" />
          Auto-fill from TMDB
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          id="title"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={() => candidates.length > 0 && setOpen(true)}
          disabled={disabled || enriching}
          className="pl-9 pr-9"
          autoComplete="off"
          required
        />
        {/* Right icon: spinner or clear */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {(searching || enriching) ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : value ? (
            <button type="button" onClick={clearSearch} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Enriching overlay message */}
      {enriching && (
        <p className="text-xs text-orange-500 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Fetching metadata from TMDB, OMDB & YouTube…
        </p>
      )}

      {/* Dropdown */}
      {open && candidates.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
          <div className="px-3 py-2 border-b border-border bg-muted/30">
            <p className="text-xs text-muted-foreground font-medium">
              {candidates.length} result{candidates.length !== 1 ? "s" : ""} from TMDB — click to auto-fill
            </p>
          </div>

          {candidates.map((c) => (
            <button
              key={c.tmdbId}
              type="button"
              onClick={() => handleSelect(c)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
            >
              {/* Poster thumbnail */}
              <div className="w-10 h-14 rounded overflow-hidden bg-muted shrink-0">
                {c.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.poster}
                    alt={c.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    ?
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{c.title}</p>
                {c.year && (
                  <Badge variant="secondary" className="text-xs mt-0.5">{c.year}</Badge>
                )}
                {c.overview && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.overview}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
