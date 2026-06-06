"use client";

import React, { useTransition, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell, ChevronsUpDown, LogOut, BadgeCheck, CreditCard,
  Search, Film, Tv, X, Loader2,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarFooter, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarTrigger,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/actions/auth";

interface SearchResult {
  id: string;
  title: string;
  type: "movie" | "series";
  poster: string;
  slug: string;
  genre?: string;
  year?: number;
}

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function DashboardNav({ user }: { user: any }) {
  const [isLoggingOut, startTransition] = useTransition();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
      router.replace("/");
    });
  };

  // Fetch search results
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    const BASE = process.env.NEXT_PUBLIC_API_URL || "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

    Promise.allSettled([
      fetch(`${BASE}/movies?search=${encodeURIComponent(q)}&limit=5`).then((r) => r.json()),
      fetch(`${BASE}/series?search=${encodeURIComponent(q)}&limit=5`).then((r) => r.json()),
    ]).then(([moviesRes, seriesRes]) => {
      const movies: SearchResult[] = (
        moviesRes.status === "fulfilled" ? moviesRes.value?.data ?? [] : []
      ).map((m: any) => ({
        id: m.id, title: m.title, type: "movie",
        poster: m.poster || m.image || "",
        slug: m.slug,
        genre: m.genre?.name,
        year: m.year?.value,
      }));

      const series: SearchResult[] = (
        seriesRes.status === "fulfilled" ? seriesRes.value?.data ?? [] : []
      ).map((s: any) => ({
        id: s.id, title: s.title, type: "series",
        poster: s.poster || "",
        slug: s.slug,
        genre: s.genre?.name,
        year: s.year?.value,
      }));

      setResults([...movies, ...series].slice(0, 8));
      setOpen(true);
    }).finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clear = () => { setQuery(""); setResults([]); setOpen(false); };

  const handleSelect = (r: SearchResult) => {
    const href = r.type === "movie"
      ? `/dashboard/movies/${r.id}/edit`
      : `/dashboard/series/${r.id}`;
    router.push(href);
    clear();
  };

  return (
    <div className="flex h-16 items-center gap-4 border-b px-4">
      <SidebarTrigger />

      {/* ── Global search ── */}
      <div ref={containerRef} className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search movies, series…"
            className="w-full h-9 pl-9 pr-8 rounded-md border border-input bg-background text-sm
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {query && (
            <button
              onClick={clear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {loading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <X className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Dropdown results */}
        {open && results.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-popover border border-border
            rounded-xl shadow-xl z-50 overflow-hidden">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelect(r)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent
                  text-left transition-colors"
              >
                {/* Poster */}
                <div className="w-8 h-10 rounded overflow-hidden bg-muted shrink-0">
                  {r.poster
                    ? <Image src={r.poster} alt={r.title} width={32} height={40} className="object-cover w-full h-full" />
                    : (r.type === "movie"
                        ? <Film className="w-4 h-4 m-auto mt-3 text-muted-foreground" />
                        : <Tv   className="w-4 h-4 m-auto mt-3 text-muted-foreground" />)
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.type === "movie" ? "Movie" : "Series"}
                    {r.genre && ` · ${r.genre}`}
                    {r.year  && ` · ${r.year}`}
                  </p>
                </div>

                <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium
                  ${r.type === "movie"
                    ? "bg-orange-500/15 text-orange-400"
                    : "bg-blue-500/15 text-blue-400"}`}>
                  {r.type === "movie" ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                </span>
              </button>
            ))}

            {/* View all link */}
            <div className="border-t border-border px-3 py-2">
              <Link
                href={`/dashboard/movies?search=${encodeURIComponent(query)}`}
                onClick={clear}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all results for "{query}" →
              </Link>
            </div>
          </div>
        )}

        {open && query.length >= 2 && results.length === 0 && !loading && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-popover border border-border
            rounded-xl shadow-xl z-50 px-4 py-6 text-center text-sm text-muted-foreground">
            No results for "{query}"
          </div>
        )}
      </div>

      {/* ── User menu ── */}
      <SidebarFooter className="p-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.imageUrl} alt={user?.name} />
                    <AvatarFallback className="rounded-lg">
                      {user?.name?.[0]?.toUpperCase() ?? "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom" align="end" sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.imageUrl} alt={user?.name} />
                      <AvatarFallback className="rounded-lg">
                        {user?.name?.[0]?.toUpperCase() ?? "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name}</span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck className="w-4 h-4 mr-2" /> Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="w-4 h-4 mr-2" /> Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="w-4 h-4 mr-2" /> Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => { e.preventDefault(); if (!isLoggingOut) handleLogout(); }}
                  disabled={isLoggingOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isLoggingOut ? "Logging out…" : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </div>
  );
}
