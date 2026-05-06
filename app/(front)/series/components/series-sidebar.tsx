"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Tv, Flame, Clock, Languages, Globe, Star, X, Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface VJ    { id: string; name: string; avatarUrl?: string; bio?: string | null }
interface Genre { id: string; name: string }
interface Year  { id: string; value: number }

interface SeriesSidebarProps {
  genres: Genre[];
  vjs:    VJ[];
  years:  Year[];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function SeriesSidebar({ genres, vjs, years }: SeriesSidebarProps) {
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
      router.push(`/series?${p.toString()}`);
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

  const clearAll = () => router.push("/series");
  const hasFilters =
    activeGenre !== "all" || activeVJ !== "all" || activeYear !== "all" ||
    activeSearch || activeTrend || activeSoon || activeDubbed;

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-20 self-start h-[calc(100vh-5rem)] overflow-y-auto pr-2">
      <div className="py-4 space-y-6">

        {/* Search */}
        <div>
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Search</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search series…"
              defaultValue={activeSearch}
              className="pl-8 h-8 text-sm"
              onChange={(e) => push({ search: e.target.value })}
            />
          </div>
        </div>

        {/* Browse */}
        <div>
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Browse</p>
          <div className="flex flex-col gap-1">
            <SideItem icon={Tv}    label="All Series"   active={!hasFilters}              onClick={clearAll} />
            <SideItem icon={Flame} label="Trending"     active={activeTrend === "1"}      onClick={() => push({ trending: activeTrend === "1" ? "" : "1" })} />
            <SideItem icon={Clock} label="Coming Soon"  active={activeSoon === "1"}       onClick={() => push({ coming_soon: activeSoon === "1" ? "" : "1" })} />
            <SideItem icon={Star}  label="Top Rated"    active={searchParams.get("sort") === "rating"} onClick={() => push({ sort: searchParams.get("sort") === "rating" ? "" : "rating" })} />
          </div>
        </div>

        {/* Language */}
        <div>
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Language</p>
          <div className="flex flex-col gap-1">
            <SideItem icon={Languages} label="Translated (VJ)" active={activeDubbed === "yes"} onClick={() => push({ dubbed: activeDubbed === "yes" ? "" : "yes" })} />
            <SideItem icon={Globe}     label="Original"        active={activeDubbed === "no"}  onClick={() => push({ dubbed: activeDubbed === "no"  ? "" : "no"  })} />
          </div>
        </div>

        {/* VJs */}
        {vjs.length > 0 && (
          <div>
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">VJ / Translator</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => push({ vj: "all" })}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                  activeVJ === "all" ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">All</div>
                All VJs
              </button>
              {vjs.map((vj) => (
                <button
                  key={vj.id}
                  onClick={() => push({ vj: activeVJ === vj.id ? "all" : vj.id })}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                    activeVJ === vj.id ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  )}
                >
                  <div className="w-6 h-6 rounded-full shrink-0 overflow-hidden bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {vj.avatarUrl
                      ? <Image src={vj.avatarUrl} alt={vj.name} width={24} height={24} className="object-cover w-full h-full" />
                      : initials(vj.name)}
                  </div>
                  <span className="truncate">{vj.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <div>
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Genre</p>
            <div className="flex flex-col gap-1">
              <button onClick={() => push({ genre: "all" })} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left", activeGenre === "all" ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>All Genres</button>
              {genres.map((g) => (
                <button key={g.id} onClick={() => push({ genre: activeGenre === g.id ? "all" : g.id })} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left", activeGenre === g.id ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>{g.name}</button>
              ))}
            </div>
          </div>
        )}

        {/* Year */}
        {years.length > 0 && (
          <div>
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Release Year</p>
            <div className="flex flex-col gap-1">
              <button onClick={() => push({ year: "all" })} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left", activeYear === "all" ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>All Years</button>
              {[...years].sort((a, b) => b.value - a.value).map((y) => (
                <button key={y.id} onClick={() => push({ year: activeYear === y.id ? "all" : y.id })} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left", activeYear === y.id ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>{y.value}</button>
              ))}
            </div>
          </div>
        )}

        {/* Clear */}
        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full">
            <X className="w-4 h-4" />
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
}

function SideItem({ icon: Icon, label, active, onClick }: { icon: React.ElementType; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full", active ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );
}
