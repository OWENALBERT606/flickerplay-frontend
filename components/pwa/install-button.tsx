"use client";

import { useState, useEffect, useRef } from "react";
import { Download, X, Monitor, Chrome, Globe, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Store the prompt globally so it survives re-renders
let _deferredPrompt: BeforeInstallPromptEvent | null = null;

export function InstallButton() {
  const [mounted, setMounted]           = useState(false);
  const [canInstall, setCanInstall]     = useState(false);
  const [isInstalled, setIsInstalled]   = useState(false);
  const [installing, setInstalling]     = useState(false);
  const [showGuide, setShowGuide]       = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Already running as installed PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // If we already captured the prompt before this component mounted
    if (_deferredPrompt) {
      setCanInstall(true);
    }

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
      setShowGuide(false);
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

  const handleClick = async () => {
    if (_deferredPrompt) {
      // ── Native one-tap install ──
      setInstalling(true);
      try {
        await _deferredPrompt.prompt();
        const { outcome } = await _deferredPrompt.userChoice;
        if (outcome === "accepted") {
          _deferredPrompt = null;
          setCanInstall(false);
        }
      } finally {
        setInstalling(false);
      }
    } else {
      // ── No prompt available — show manual guide ──
      setShowGuide(s => !s);
    }
  };

  if (!mounted || isInstalled) return null;

  return (
    <div className="relative" ref={guideRef}>
      <button
        onClick={handleClick}
        disabled={installing}
        className={`
          flex items-center gap-1.5 text-white text-xs font-bold px-3 h-8 rounded-lg
          transition-all duration-200 shrink-0 cursor-pointer select-none
          ${canInstall
            ? "bg-orange-500 hover:bg-orange-600 active:scale-95 shadow-lg shadow-orange-500/30"
            : "bg-orange-500/80 hover:bg-orange-500"
          }
          ${installing ? "opacity-70 cursor-wait" : ""}
        `}
        title={canInstall ? "Click to install FlickerPlay" : "Install FlickerPlay"}
      >
        {installing ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            <span>Installing…</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Download App</span>
            {canInstall && (
              <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" title="Ready to install" />
            )}
          </>
        )}
      </button>

      {/* Manual install guide — only when browser hasn't provided the prompt */}
      {showGuide && !canInstall && (
        <div className="absolute right-0 top-full mt-2 z-[100] w-72 bg-background border border-border rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-semibold">Install FlickerPlay</p>
            </div>
            <button onClick={() => setShowGuide(false)} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Install FlickerPlay as a desktop app — no browser chrome, faster launch, works offline.
          </p>

          <div className="space-y-2">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border">
              <Chrome className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold mb-0.5">Google Chrome</p>
                <p className="text-xs text-muted-foreground">
                  Click <strong>⋮</strong> → <strong>Save and share</strong> → <strong>Install page as app</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border">
              <Globe className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold mb-0.5">Microsoft Edge</p>
                <p className="text-xs text-muted-foreground">
                  Click <strong>⋯</strong> → <strong>Apps</strong> → <strong>Install this site as an app</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <p className="text-[10px] text-orange-600 font-medium text-center">
              💡 Tip: Visit the site a few times and the browser will offer automatic install
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
