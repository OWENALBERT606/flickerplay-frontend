"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { MovieGrid } from "./movies-grid";
import type { Movie } from "@/actions/movies";

interface DiscoverInfiniteGridProps {
  /** Discovery section identifier sent to /api/movies/discover?section= */
  section: string;
  /** Genre name — used when section=genre */
  genre?: string;
  /** User ID — used for personalized sections */
  userId?: string;
  initialMovies: Movie[];
  initialPage: number;
  totalPages: number;
  /** Items per page (must match server initial fetch) */
  limit?: number;
  cols?: 2 | 3 | 4 | 5 | 6 | 7;
  emptyMessage?: string;
}

export function DiscoverInfiniteGrid({
  section,
  genre,
  userId,
  initialMovies,
  initialPage,
  totalPages,
  limit = 18,
  cols = 6,
  emptyMessage,
}: DiscoverInfiniteGridProps) {
  const [movies, setMovies]   = useState<Movie[]>(initialMovies);
  const [page, setPage]       = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPage < totalPages);
  const sentinelRef           = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMovies(initialMovies);
    setPage(initialPage);
    setHasMore(initialPage < totalPages);
  }, [initialMovies, initialPage, totalPages]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({ section, page: String(nextPage), limit: String(limit) });
      if (genre)  params.set("genre", genre);
      if (userId) params.set("userId", userId);

      const res = await fetch(`/api/movies/discover?${params.toString()}`);
      if (!res.ok) throw new Error("fetch failed");

      const json = await res.json();
      const newMovies: Movie[] = json.data ?? [];
      const newTotalPages: number = json.totalPages ?? 1;

      if (newMovies.length > 0) {
        setMovies(prev => {
          const ids = new Set(prev.map(m => m.id));
          return [...prev, ...newMovies.filter(m => !ids.has(m.id))];
        });
        setPage(nextPage);
        setHasMore(nextPage < newTotalPages);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error("discover infinite scroll error:", e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, section, genre, userId, limit]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "300px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <MovieGrid movies={movies} cols={cols} emptyMessage={emptyMessage} />
      <div ref={sentinelRef} className="h-4" />
      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          <span className="text-sm">Loading more movies…</span>
        </div>
      )}
    </>
  );
}
