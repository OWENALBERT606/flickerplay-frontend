"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Film, Flame, Clock, Languages, Globe, Star, X, Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface VJ    { id: string; name: string; avatarUrl?: string; bio?: string | null }
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

  const get  = (key: string) => searchParams.get(key) ?? "all";
  const getS = (key: string) => searchParams.get(key) ?? "";

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
  const activeSearch = getS("search");
  const activeTrend  = searchParams.get("trending");
  const activeSoon   = searchParams.get("coming_soon");
  const activeDubbed = searchParams.get("dubbed");

  const clearAll = () => router.push("/movies");
  const hasFilters =
    activeGenre !== "all" || activeVJ !== "all" || activeYear !== "all" ||
    activeSearch || activeTrend || activeSoon || activeDubbed;

  return (
    <div className="w-full space-y-3 pb-4 border-b border-border/40">

      {/* ── Row 1: Search + quick browse + language ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative shrink-0 w-44">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search movies…"
            defaultValue={activeSearch}
            className="pl-8 h-8 text-sm"
            onChange={(e) => push({ search: e.target.value })}
          />
        </div>

        <div className="h-5 w-px bg-border/60 mx-0.5" />

        <Pill label="All" active={!hasFilters} onClick={clearAll} icon={Film} />
        <Pill label="Trending" active={activeTrend === "1"} icon={Flame}
          onClick={() => push({ trending: activeTrend === "1" ? "" : "1" })} />
        <Pill label="Coming Soon" active={activeSoon === "1"} icon={Clock}
          onClick={() => push({ coming_soon: activeSoon === "1" ? "" : "1" })} />
        <Pill label="Top Rated" active={searchParams.get("sort") === "rating"} icon={Star}
          onClick={() => push({ sort: searchParams.get("sort") === "rating" ? "" : "rating" })} />

        <div className="h-5 w-px bg-border/60 mx-0.5" />

        <Pill label="VJ Translated" active={activeDubbed === "yes"} icon={Languages}
          onClick={() => push({ dubbed: activeDubbed === "yes" ? "" : "yes" })} />
        <Pill label="Original" active={activeDubbed === "no"} icon={Globe}
          onClick={() => push({ dubbed: activeDubbed === "no" ? "" : "no" })} />

        {hasFilters && (
          <button
            onClick={clearAll}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* ── Row 2: VJ avatars ── */}
      {vjs.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0 w-10">VJ</span>
          <div className="overflow-x-auto pb-1 flex-1">
            <div className="flex items-center gap-2 w-max">
              <button
                onClick={() => push({ vj: "all" })}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0",
                  activeVJ === "all"
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-border text-muted-foreground hover:border-orange-400 hover:text-foreground",
                )}
              >
                All VJs
              </button>
              {vjs.map((vj) => (
                <button
                  key={vj.id}
                  onClick={() => push({ vj: activeVJ === vj.id ? "all" : vj.id })}
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

      {/* ── Row 3: Genres ── */}
      {genres.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0 w-10">Genre</span>
          <div className="overflow-x-auto pb-1 flex-1">
            <div className="flex items-center gap-2 w-max">
              <Pill label="All" active={activeGenre === "all"} onClick={() => push({ genre: "all" })} />
              {genres.map((g) => (
                <Pill
                  key={g.id}
                  label={g.name}
                  active={activeGenre === g.id}
                  onClick={() => push({ genre: activeGenre === g.id ? "all" : g.id })}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Row 4: Years ── */}
      {years.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0 w-10">Year</span>
          <div className="overflow-x-auto pb-1 flex-1">
            <div className="flex items-center gap-2 w-max">
              <Pill label="All" active={activeYear === "all"} onClick={() => push({ year: "all" })} />
              {[...years].sort((a, b) => b.value - a.value).map((y) => (
                <Pill
                  key={y.id}
                  label={String(y.value)}
                  active={activeYear === y.id}
                  onClick={() => push({ year: activeYear === y.id ? "all" : y.id })}
                />
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
