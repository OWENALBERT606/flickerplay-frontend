"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Bookmark, UserCircle } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/series", label: "Series", icon: Tv },
  { href: "/list", label: "My List", icon: Bookmark },
  { href: "/account", label: "Profile", icon: UserCircle },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    /* Hidden on desktop (md+) and on Smart TVs via css: html[data-tv] .mobile-bottom-nav */
    <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
