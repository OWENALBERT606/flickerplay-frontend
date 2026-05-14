
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Bell, User, Menu, X, LogOut, LayoutDashboard, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/actions/auth";
import { GlobalSearch } from "../globalsearch";
import { InstallButton } from "@/components/pwa/install-button";

export function Header({ user }: { user?: any }) {
  const [isLoggingOut, startTransition] = useTransition();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  // Determine profile route based on user role
  const getProfileRoute = () => {
    if (!user) return "/login";
    
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "MANAGER";
    
    return isAdmin ? "/dashboard" : "/account";
  };

  // Handle scroll behavior (only on mobile)
  useEffect(() => {
    const handleScroll = () => {
      // Only apply auto-hide on mobile/tablet (< 768px)
      if (window.innerWidth >= 768) {
        setIsVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;

      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Hide header when scrolling down (after scrolling past 10px)
      else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false);
        setIsMenuOpen(false); // Close mobile menu when hiding
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="px-4 md:px-8 lg:px-12 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-flickerplay.png"
              alt="FlickerPlay"
              width={160}
              height={100}
              className="h-10 w-32 object-contain"
            />
            <div className="text-2xl  font-bold text-primary hidden">
              FlickerPlay
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link
              href="/movies"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Movies
            </Link>
            <Link
              href="/series"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Series
            </Link>
            <Link
              href="/list"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              My List
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* PWA Install Button — only shown when browser fires beforeinstallprompt */}
            <InstallButton />

            {/* ✅ Global Search */}
            <div className="hidden md:block">
              <GlobalSearch />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="w-5 h-5" />
            </Button>

            {/* Profile */}
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
                      width={36}
                      height={36}
                      className="rounded-full ring-2 ring-transparent hover:ring-orange-500 transition"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-transparent hover:ring-orange-400 transition">
                      {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:block text-sm text-foreground truncate max-w-[140px]">
                    {user.email}
                  </span>
                </button>

                {/* Dropdown */}
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
                <Button variant="default">Login</Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <nav className="flex flex-col space-y-4 mt-4">
              {/* ✅ Mobile Search */}
              <GlobalSearch />

              <Link
                href="/"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/movies"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Movies
              </Link>
              <Link
                href="/series"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Series
              </Link>
              <Link
                href="/list"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                My List
              </Link>
              {/* ✅ Mobile Profile/Dashboard Link */}
              {user && (
                <Link
                  href={getProfileRoute()}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "MANAGER" ? (
                    <>
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </>
                  ) : (
                    <>
                      <UserCircle className="w-4 h-4" />
                      Profile
                    </>
                  )}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}