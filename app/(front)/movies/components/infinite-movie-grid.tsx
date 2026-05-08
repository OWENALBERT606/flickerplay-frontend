"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { MovieGrid } from "./movies-grid";
import type { Movie } from "@/actions/movies";

interface InfiniteMovieGridProps {
  initialMovies: Movie[];
  initialPage: number;
  totalPages: number;
  userId?: string;
  /** Current search params — passed to the fetch so filters are preserved */
  searchParams: Record<string, string | undefined>;
}

export function InfiniteMovieGrid({
  initialMovies,
  initialPage,
  totalPages,
  userId,
  searchParams,
}: InfiniteMovieGridProps) {
  const [movies, setMovies]     = useState<Movie[]>(initialMovies);
  const [page, setPage]         = useState(initialPage);
  const [loading, setLoading]   = useState(false);
  const [hasMore, setHasMore]   = useState(initialPage < totalPages);
  const sentinelRef             = useRef<HTMLDivElement>(null);

  // Reset when filters change (initialMovies changes)
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
      const params = new URLSearchParams();

      // Preserve all active filters
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v && k !== "page") params.set(k, v);
      });
      params.set("page", String(nextPage));

      const res = await fetch(`/api/movies?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      const newMovies: Movie[] = data.movies || [];
      const newTotalPages: number = data.totalPages || 1;

      if (newMovies.length > 0) {
        setMovies(prev => {
          // Deduplicate by id
          const ids = new Set(prev.map(m => m.id));
          return [...prev, ...newMovies.filter(m => !ids.has(m.id))];
        });
        setPage(nextPage);
        setHasMore(nextPage < newTotalPages);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error("Infinite scroll load error:", e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, searchParams]);

  // IntersectionObserver — fires when sentinel enters viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "300px" } // start loading 300px before the bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <MovieGrid userId={userId} movies={movies} />

      {/* Sentinel — invisible div at the bottom that triggers loading */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading spinner */}
      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          <span className="text-sm">Loading more movies…</span>
        </div>
      )}

      {/* End of results */}
      {!hasMore && movies.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-8">
          You've seen all {movies.length} movies
        </p>
      )}
    </>
  );
}
