"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal, X, Search, Flame, Clock, Star,
  Languages, Globe, ChevronDown, ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";

/* ─── Types ─────────────────────────────────────────────────────── */
interface VJ    { id: string; name: string; avatarUrl?: string }
interface Genre { id: string; name: string }
interface Year  { id: string; value: number }

export interface FilterDrawerProps {
  basePath: string;
  placeholder?: string;
  genres:  Genre[];
  vjs:     VJ[];
  years:   Year[];
  allLabel?: string;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ─── Section accordion ─────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-3 px-1 text-sm font-semibold text-foreground"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

/* ─── Pill button ───────────────────────────────────────────────── */
function Pill({ label, active, onClick, avatar }: { label: string; active: boolean; onClick: () => void; avatar?: React.ReactNode }) {
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
      {avatar}
      {label}
    </button>
  );
}

/* ─── Main component ────────────────────────────────────────────── */
export function FilterDrawer({
  basePath,
  placeholder = "Search…",
  genres,
  vjs,
  years,
  allLabel = "All",
}: FilterDrawerProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen]         = useState(false);
  const [searchVal, setSearchVal] = useState(searchParams.get("search") ?? "");

  const get = (key: string) => searchParams.get(key) ?? "all";

  const push = useCallback(
    (updates: Record<string, string>, close = false) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (!v || v === "all") p.delete(k);
        else p.set(k, v);
      });
      p.delete("page");
      router.push(`${basePath}?${p.toString()}`);
      if (close) setOpen(false);
    },
    [router, searchParams, basePath],
  );

  const clearAll = () => {
    setSearchVal("");
    router.push(basePath);
    setOpen(false);
  };

  const activeGenre  = get("genre");
  const activeVJ     = get("vj");
  const activeYear   = get("year");
  const activeTrend  = searchParams.get("trending");
  const activeSoon   = searchParams.get("coming_soon");
  const activeDubbed = searchParams.get("dubbed");
  const activeSort   = searchParams.get("sort");

  const activeCount = [
    activeGenre !== "all",
    activeVJ !== "all",
    activeYear !== "all",
    !!searchVal,
    activeTrend === "1",
    activeSoon === "1",
    !!activeDubbed,
    activeSort === "rating",
  ].filter(Boolean).length;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => push({ search: searchVal }), 400);
    return () => clearTimeout(t);
  }, [searchVal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Top bar: search + filter button ── */}
      <div className="lg:hidden flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="pl-9 h-10"
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setOpen(true)}
          className={cn(
            "flex items-center gap-2 px-3 h-10 rounded-lg border text-sm font-medium transition-colors shrink-0",
            activeCount > 0
              ? "bg-orange-500 border-orange-500 text-white"
              : "border-border text-muted-foreground hover:border-orange-400 hover:text-foreground",
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="bg-white text-orange-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Active filter chips (mobile/tablet) ── */}
      {activeCount > 0 && (
        <div className="lg:hidden flex items-center gap-2 flex-wrap mb-4">
          {activeTrend === "1" && <ActiveChip label="Trending" onRemove={() => push({ trending: "" })} />}
          {activeSoon === "1"  && <ActiveChip label="Coming Soon" onRemove={() => push({ coming_soon: "" })} />}
          {activeSort === "rating" && <ActiveChip label="Top Rated" onRemove={() => push({ sort: "" })} />}
          {activeDubbed === "yes" && <ActiveChip label="Translated (VJ)" onRemove={() => push({ dubbed: "" })} />}
          {activeDubbed === "no"  && <ActiveChip label="Original" onRemove={() => push({ dubbed: "" })} />}
          {activeVJ !== "all" && <ActiveChip label={vjs.find(v => v.id === activeVJ)?.name ?? activeVJ} onRemove={() => push({ vj: "all" })} />}
          {activeGenre !== "all" && <ActiveChip label={genres.find(g => g.id === activeGenre)?.name ?? activeGenre} onRemove={() => push({ genre: "all" })} />}
          {activeYear !== "all" && <ActiveChip label={String(years.find(y => y.id === activeYear)?.value ?? activeYear)} onRemove={() => push({ year: "all" })} />}
          <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 underline ml-1">Clear all</button>
        </div>
      )}

      {/* ── Backdrop ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Drawer panel (slides up from bottom on mobile, from right on tablet) ── */}
      <div
        className={cn(
          "lg:hidden fixed z-50 bg-background border-border overflow-y-auto transition-transform duration-300",
          // Mobile: bottom sheet
          "bottom-0 left-0 right-0 rounded-t-2xl border-t max-h-[85vh]",
          // Tablet (md+): right panel
          "md:bottom-0 md:top-0 md:left-auto md:right-0 md:w-80 md:rounded-none md:rounded-l-2xl md:border-l md:border-t-0 md:max-h-full",
          open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full",
        )}
      >
        {/* Handle bar (mobile only) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="font-semibold text-base">
            Filters {activeCount > 0 && <span className="text-orange-500">({activeCount})</span>}
          </h2>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 font-medium">
                Clear all
              </button>
            )}
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-8 space-y-1">

          {/* Quick filters */}
          <Section title="Browse">
            <div className="flex flex-wrap gap-2 pt-1">
              <Pill label={allLabel} active={activeCount === 0} onClick={clearAll} />
              <Pill label="Trending"    active={activeTrend === "1"}      onClick={() => push({ trending: activeTrend === "1" ? "" : "1" }, true)} />
              <Pill label="Coming Soon" active={activeSoon === "1"}       onClick={() => push({ coming_soon: activeSoon === "1" ? "" : "1" }, true)} />
              <Pill label="Top Rated"   active={activeSort === "rating"}  onClick={() => push({ sort: activeSort === "rating" ? "" : "rating" }, true)} />
            </div>
          </Section>

          {/* Language */}
          <Section title="Language">
            <div className="flex flex-wrap gap-2 pt-1">
              <Pill label="Translated (VJ)" active={activeDubbed === "yes"} onClick={() => push({ dubbed: activeDubbed === "yes" ? "" : "yes" })} />
              <Pill label="Original"        active={activeDubbed === "no"}  onClick={() => push({ dubbed: activeDubbed === "no"  ? "" : "no"  })} />
            </div>
          </Section>

          {/* VJs */}
          {vjs.length > 0 && (
            <Section title="VJ / Translator">
              <div className="flex flex-wrap gap-2 pt-1">
                <Pill label="All VJs" active={activeVJ === "all"} onClick={() => push({ vj: "all" })} />
                {vjs.map((vj) => (
                  <Pill
                    key={vj.id}
                    label={vj.name}
                    active={activeVJ === vj.id}
                    onClick={() => push({ vj: activeVJ === vj.id ? "all" : vj.id })}
                    avatar={
                      <div className="w-4 h-4 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                        {vj.avatarUrl
                          ? <Image src={vj.avatarUrl} alt={vj.name} width={16} height={16} className="object-cover w-full h-full" />
                          : initials(vj.name)}
                      </div>
                    }
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Genres */}
          {genres.length > 0 && (
            <Section title="Genre">
              <div className="flex flex-wrap gap-2 pt-1">
                <Pill label="All Genres" active={activeGenre === "all"} onClick={() => push({ genre: "all" })} />
                {genres.map((g) => (
                  <Pill key={g.id} label={g.name} active={activeGenre === g.id} onClick={() => push({ genre: activeGenre === g.id ? "all" : g.id })} />
                ))}
              </div>
            </Section>
          )}

          {/* Years */}
          {years.length > 0 && (
            <Section title="Release Year">
              <div className="flex flex-wrap gap-2 pt-1">
                <Pill label="All Years" active={activeYear === "all"} onClick={() => push({ year: "all" })} />
                {[...years].sort((a, b) => b.value - a.value).map((y) => (
                  <Pill key={y.id} label={String(y.value)} active={activeYear === y.id} onClick={() => push({ year: activeYear === y.id ? "all" : y.id })} />
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Apply button (sticky bottom) */}
        <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3">
          <button
            onClick={() => setOpen(false)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl py-3 transition-colors"
          >
            Show Results
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Active chip ─────────────────────────────────────────────────── */
function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-500 text-xs font-medium border border-orange-500/30">
      {label}
      <button onClick={onRemove} className="hover:text-orange-300 ml-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
