"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Home, Tv, Film, Flame, Eye, Clock, Star, Clapperboard, Languages, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home",         href: "/",                   icon: Home,         param: null           },
  { label: "TV Series",    href: "/?type=series",       icon: Tv,           param: "series"       },
  { label: "Movies",       href: "/?type=movies",       icon: Film,         param: "movies"       },
  { label: "Trending",     href: "/?type=trending",     icon: Flame,        param: "trending"     },
  { label: "Most Watched", href: "/?type=most-watched", icon: Eye,          param: "most-watched" },
  { label: "Coming Soon",  href: "/?type=coming-soon",  icon: Clock,        param: "coming-soon"  },
  { label: "Top Rated",    href: "/?type=top-rated",    icon: Star,         param: "top-rated"    },
  { label: "New Releases", href: "/?type=new",          icon: Clapperboard, param: "new"          },
];

const DUBBED_ITEMS = [
  { label: "Translated (VJ)", href: "/?dubbed=yes", icon: Languages, dubbed: "yes" },
  { label: "Original",        href: "/?dubbed=no",  icon: Globe,     dubbed: "no"  },
];

export function HomeSidebar() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const currentType   = searchParams.get("type");
  const currentDubbed = searchParams.get("dubbed");

  const isTypeActive = (param: string | null) => {
    if (param === null) return pathname === "/" && !currentType && !currentDubbed;
    return currentType === param && !currentDubbed;
  };
  const isDubbedActive = (dubbed: string) => currentDubbed === dubbed;

  const allItems = [
    ...NAV_ITEMS.map((i) => ({ ...i, dubbed: null as string | null })),
    { label: "──", href: "#", icon: null as any, param: "__divider__", dubbed: null },
    ...DUBBED_ITEMS.map((i) => ({ ...i, param: null as string | null })),
  ];

  return (
    <>
      {/* ── Mobile / tablet: horizontal scrollable pill row ── */}
      <div className="lg:hidden w-full overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        <div className="flex items-center gap-2 w-max">
          {NAV_ITEMS.map(({ label, href, icon: Icon, param }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-colors shrink-0",
                isTypeActive(param)
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "border-border text-muted-foreground hover:border-orange-400 hover:text-foreground",
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </Link>
          ))}
          <div className="w-px h-5 bg-border mx-1 shrink-0" />
          {DUBBED_ITEMS.map(({ label, href, icon: Icon, dubbed }) => (
            <Link
              key={dubbed}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-colors shrink-0",
                isDubbedActive(dubbed)
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "border-border text-muted-foreground hover:border-orange-400 hover:text-foreground",
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Desktop: vertical sidebar ── */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 sticky top-20 self-start h-[calc(100vh-5rem)] overflow-y-auto">
        <nav className="flex flex-col gap-1 py-4">
          {NAV_ITEMS.map(({ label, href, icon: Icon, param }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isTypeActive(param)
                  ? "bg-orange-500 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}

          <div className="my-3 border-t border-border" />
          <p className="px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Language
          </p>

          {DUBBED_ITEMS.map(({ label, href, icon: Icon, dubbed }) => (
            <Link
              key={dubbed}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isDubbedActive(dubbed)
                  ? "bg-orange-500 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
