
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  Bell, LogOut, LayoutDashboard, UserCircle,
  Menu, Home, Film, Tv, Flame, Eye, Clock, Star, Clapperboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/actions/auth";
import { GlobalSearch } from "../globalsearch";
import { InstallButton } from "@/components/pwa/install-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const MOBILE_NAV_ITEMS = [
  { label: "Home",         href: "/",                   icon: Home         },
  { label: "TV Series",    href: "/?type=series",       icon: Tv           },
  { label: "Movies",       href: "/?type=movies",       icon: Film         },
  { label: "Trending",     href: "/?type=trending",     icon: Flame        },
  { label: "Most Watched", href: "/?type=most-watched", icon: Eye          },
  { label: "Coming Soon",  href: "/?type=coming-soon",  icon: Clock        },
  { label: "Top Rated",    href: "/?type=top-rated",    icon: Star         },
  { label: "New Releases", href: "/?type=new",          icon: Clapperboard },
];

export function Header({ user }: { user?: any }) {
  const [isLoggingOut, startTransition] = useTransition();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
      router.replace("/");
    });
  };

  const getProfileRoute = () => {
    if (!user) return "/login";
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "MANAGER";
    return isAdmin ? "/dashboard" : "/account";
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 768) {
        setIsVisible(true);
        return;
      }
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="px-4 md:px-8 lg:px-12 py-3 md:py-4">
        {/* ── Main row ── */}
        <div className="flex items-center justify-between gap-3">
          {/* Mobile hamburger → side sheet */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden shrink-0 -ml-1">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <nav className="flex flex-col gap-1 p-4 pt-8">
                {MOBILE_NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-flickerplay.png"
              alt="FlickerPlay"
              width={160}
              height={40}
              unoptimized
              className="h-8 md:h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/movies" className="text-muted-foreground hover:text-primary transition-colors">
              Movies
            </Link>
            <Link href="/series" className="text-muted-foreground hover:text-primary transition-colors">
              Series
            </Link>
            <Link href="/list" className="text-muted-foreground hover:text-primary transition-colors">
              My List
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-4">
            <InstallButton />
            <div className="hidden md:block">
              <GlobalSearch />
            </div>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="w-5 h-5" />
            </Button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-transparent hover:ring-orange-500 transition"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-transparent hover:ring-orange-400 transition">
                      {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:block text-sm text-foreground truncate max-w-[140px]">
                    {user.email}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-xl shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      {(user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "MANAGER") && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                          {user.role.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    <div className="p-2 space-y-0.5">
                      <Link
                        href={getProfileRoute()}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                      >
                        {user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "MANAGER" ? (
                          <><LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Dashboard</>
                        ) : (
                          <><UserCircle className="w-4 h-4 text-muted-foreground" /> Profile</>
                        )}
                      </Link>
                      <button
                        onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); if (!isLoggingOut) handleLogout(); }}
                        disabled={isLoggingOut}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4" />
                        {isLoggingOut ? "Logging out..." : "Log out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Mobile search row ── */}
        <div className="md:hidden mt-2">
          <GlobalSearch />
        </div>
      </div>
    </header>
  );
}
