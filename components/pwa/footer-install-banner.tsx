"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Smartphone, Monitor, X, Chrome, Globe, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let _deferredPrompt: BeforeInstallPromptEvent | null = null;

export function FooterInstallBanner() {
  const [mounted, setMounted]         = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall]   = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const [isIOS, setIsIOS]             = useState(false);
  const [showGuide, setShowGuide]     = useState(false);
  const [installing, setInstalling]   = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Detect platform
    const ua = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    const ios    = /iPhone|iPad|iPod/i.test(ua);
    setIsMobile(mobile);
    setIsIOS(ios);

    // Already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    if (_deferredPrompt) setCanInstall(true);

    const handler = (e: Event) => {
      e.preventDefault();
      _deferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      _deferredPrompt = null;
      setCanInstall(false);
      setIsInstalled(true);
    });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Close guide on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (guideRef.current && !guideRef.current.contains(e.target as Node)) {
        setShowGuide(false);
      }
    };
    if (showGuide) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showGuide]);

  const handleInstall = async () => {
    if (_deferredPrompt) {
      setInstalling(true);
      try {
        await _deferredPrompt.prompt();
        const { outcome } = await _deferredPrompt.userChoice;
        if (outcome === "accepted") { _deferredPrompt = null; setCanInstall(false); }
      } finally { setInstalling(false); }
    } else {
      setShowGuide(s => !s);
    }
  };

  if (!mounted || isInstalled) return null;

  return (
    <div className="relative border-t border-orange-500/20 pt-8 mt-8" ref={guideRef}>
      {/* ── Section heading ── */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-300 rounded-full" />
        <h3 className="text-lg font-bold text-foreground">Get the App</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* ── Desktop install card ── */}
        <button
          onClick={handleInstall}
          disabled={installing}
          className="group flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl hover:border-orange-500/50 hover:from-orange-500/15 transition-all duration-300 text-left w-full"
        >
          <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            {installing
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Monitor className="w-5 h-5 text-white" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Windows / Mac / Linux</p>
            <p className="text-sm font-semibold text-foreground">
              {installing ? "Installing…" : canInstall ? "Install Desktop App" : "Download Desktop App"}
            </p>
            {canInstall && !installing && (
              <p className="text-xs text-green-500 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                Ready to install
              </p>
            )}
          </div>
          <Download className="w-4 h-4 text-orange-500 group-hover:translate-y-0.5 transition-transform shrink-0" />
        </button>

        {/* ── Mobile / Add to Home Screen card ── */}
        <button
          onClick={() => setShowGuide(s => !s)}
          className="group flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl hover:border-blue-500/50 transition-all duration-300 text-left w-full"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Android / iPhone / iPad</p>
            <p className="text-sm font-semibold text-foreground">Add to Home Screen</p>
            <p className="text-xs text-muted-foreground mt-0.5">Works like a native app</p>
          </div>
          <Download className="w-4 h-4 text-blue-500 group-hover:translate-y-0.5 transition-transform shrink-0" />
        </button>
      </div>

      {/* ── Install guide dropdown ── */}
      {showGuide && (
        <div className="mt-3 bg-background border border-border rounded-xl shadow-2xl p-5 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">How to Install FlickerPlay</p>
            <button onClick={() => setShowGuide(false)} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Android Chrome */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <Chrome className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">Android (Chrome)</p>
                <ol className="text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
                  <li>Tap the <strong>⋮</strong> menu</li>
                  <li>Tap <strong>"Add to Home screen"</strong></li>
                  <li>Tap <strong>Add</strong></li>
                </ol>
              </div>
            </div>

            {/* iPhone / iPad Safari */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Share className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">iPhone / iPad (Safari)</p>
                <ol className="text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
                  <li>Tap the <strong>Share</strong> button <strong>⬆</strong></li>
                  <li>Scroll down, tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>Add</strong></li>
                </ol>
              </div>
            </div>

            {/* Windows Chrome */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <Chrome className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">Windows (Chrome)</p>
                <ol className="text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
                  <li>Click <strong>⋮</strong> menu</li>
                  <li>Click <strong>"Save and share"</strong></li>
                  <li>Click <strong>"Install page as app"</strong></li>
                </ol>
              </div>
            </div>

            {/* Windows Edge */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">Windows (Edge)</p>
                <ol className="text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
                  <li>Click <strong>⋯</strong> menu</li>
                  <li>Click <strong>"Apps"</strong></li>
                  <li>Click <strong>"Install this site as an app"</strong></li>
                </ol>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground mt-4 text-center">
            Once installed, FlickerPlay opens like a native app — no browser bar, full screen, works offline
          </p>
        </div>
      )}
    </div>
  );
}
