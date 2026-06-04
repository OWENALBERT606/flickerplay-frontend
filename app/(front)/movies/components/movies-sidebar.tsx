"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Film, Flame, Clock, Languages, Globe, Star, X, Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface VJ    { id: string; name: string; avatarUrl?: string }
interface Genre { id: string; name: string }
interface Year  { id: string; value: number }

interface MoviesSidebarProps {
  genres: Genre[];
  vjs:    VJ[];
  years:  Year[];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function MoviesSidebar({ genres, vjs, years }: MoviesSidebarProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const get  = (key: string) => searchParams.get(key) ?? "";

  const push = useCallback(
    (updates: Record<string, string>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (!v || v === "all") p.delete(k);
        else p.set(k, v);
      });
      p.delete("page");
      router.push(`/movies?${p.toString()}`);
    },
    [router, searchParams],
  );

  const activeGenre  = get("genre");
  const activeVJ     = get("vj");
  const activeYear   = get("year");
  const activeSearch = get("search");
  const activeTrend  = get("trending");
  const activeSoon   = get("coming_soon");
  const activeDubbed = get("dubbed");
  const activeSort   = get("sort");

  const clearAll = () => router.push("/movies");
  const hasFilters =
    activeGenre || activeVJ || activeYear || activeSearch ||
    activeTrend || activeSoon || activeDubbed || activeSort;

  const sortedYears = [...years].sort((a, b) => b.value - a.value);

  return (
    <div className="w-full space-y-3 pb-4 border-b border-border/40">

      {/* ── Row 1: Search (full width) ── */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search movies…"
          defaultValue={activeSearch}
          className="pl-10 h-10 text-sm w-full"
          onChange={(e) => push({ search: e.target.value })}
        />
      </div>

      {/* ── Row 2: Dropdowns + Clear ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Genre dropdown */}
        <Select
          value={activeGenre || "all"}
          onValueChange={(v) => push({ genre: v })}
        >
          <SelectTrigger className="h-9 w-40 text-sm">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map((g) => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year dropdown */}
        <Select
          value={activeYear || "all"}
          onValueChange={(v) => push({ year: v })}
        >
          <SelectTrigger className="h-9 w-32 text-sm">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {sortedYears.map((y) => (
              <SelectItem key={y.id} value={y.id}>{y.value}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort dropdown */}
        <Select
          value={activeSort || "default"}
          onValueChange={(v) => push({ sort: v === "default" ? "" : v })}
        >
          <SelectTrigger className="h-9 w-40 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default order</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="views">Most Viewed</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors shrink-0"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>

      {/* ── Row 3: Quick browse + Language ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Pill label="All" icon={Film}       active={!hasFilters}          onClick={clearAll} />
        <Pill label="Trending" icon={Flame} active={activeTrend === "1"}  onClick={() => push({ trending: activeTrend === "1" ? "" : "1" })} />
        <Pill label="Coming Soon" icon={Clock} active={activeSoon === "1"} onClick={() => push({ coming_soon: activeSoon === "1" ? "" : "1" })} />
        <Pill label="Top Rated" icon={Star} active={activeSort === "rating"} onClick={() => push({ sort: activeSort === "rating" ? "" : "rating" })} />

        <div className="h-5 w-px bg-border/60 mx-1 hidden sm:block" />

        <Pill label="VJ Dubbed" icon={Languages} active={activeDubbed === "yes"} onClick={() => push({ dubbed: activeDubbed === "yes" ? "" : "yes" })} />
        <Pill label="Original"  icon={Globe}     active={activeDubbed === "no"}  onClick={() => push({ dubbed: activeDubbed === "no"  ? "" : "no" })} />
      </div>

      {/* ── Row 4: VJ filter ── */}
      {vjs.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0 w-6">VJ</span>
          <div className="overflow-x-auto pb-1 flex-1 scrollbar-none">
            <div className="flex items-center gap-2 w-max">
              <button
                onClick={() => push({ vj: "all" })}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0",
                  !activeVJ
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-border text-muted-foreground hover:border-orange-400 hover:text-foreground",
                )}
              >
                All VJs
              </button>
              {vjs.map((vj) => (
                <button
                  key={vj.id}
                  onClick={() => push({ vj: activeVJ === vj.id ? "" : vj.id })}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0",
                    activeVJ === vj.id
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "border-border text-muted-foreground hover:border-orange-400 hover:text-foreground",
                  )}
                >
                  <div className="w-4 h-4 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                    {vj.avatarUrl ? (
                      <Image src={vj.avatarUrl} alt={vj.name} width={16} height={16} className="object-cover w-full h-full" />
                    ) : (
                      initials(vj.name)
                    )}
                  </div>
                  {vj.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({
  label, active, onClick, icon: Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ElementType;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0",
        active
          ? "bg-orange-500 border-orange-500 text-white"
          : "border-border text-muted-foreground hover:border-orange-400 hover:text-foreground",
      )}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {label}
    </button>
  );
}
