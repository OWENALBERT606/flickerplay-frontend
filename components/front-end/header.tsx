
"use client";

import { useState, useTransition, useEffect } from "react";
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
              <div className="relative group">
                <button className="flex items-center gap-2 focus:outline-none">
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:block text-sm text-foreground truncate max-w-[150px]">
                    {user.email}
                  </span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    {/* Show role badge for admins */}
                    {(user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "MANAGER") && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-orange-500 text-white rounded">
                        {user.role}
                      </span>
                    )}
                  </div>
                  
                  <div className="p-2">
                    {/* ✅ Profile/Dashboard Link */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left mb-1"
                      asChild
                    >
                      <Link href={getProfileRoute()}>
                        {user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "MANAGER" ? (
                          <>
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                          </>
                        ) : (
                          <>
                            <UserCircle className="w-4 h-4 mr-2" />
                            Profile
                          </>
                        )}
                      </Link>
                    </Button>

                    {/* Logout Button */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isLoggingOut) handleLogout();
                      }}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {isLoggingOut ? "Logging out..." : "Log out"}
                    </Button>
                  </div>
                </div>
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