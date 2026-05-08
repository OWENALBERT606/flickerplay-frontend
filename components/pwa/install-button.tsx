"use client";

import { useState, useEffect, useRef } from "react";
import { Download, X, Monitor, Chrome, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled]     = useState(false);
  const [showGuide, setShowGuide]         = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstallPrompt(null);
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
    if (installPrompt) {
      // Native install prompt available — trigger it directly
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") setInstallPrompt(null);
    } else {
      // No prompt yet — show manual install guide
      setShowGuide(s => !s);
    }
  };

  // Don't show if already installed as PWA
  if (isInstalled) return null;

  return (
    <div className="relative" ref={guideRef}>
      <Button
        onClick={handleClick}
        size="sm"
        className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5 font-semibold px-3 h-8 text-xs"
        title="Install FlickerPlay as a desktop app"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>Download App</span>
      </Button>

      {/* Manual install guide — shown when browser hasn't fired beforeinstallprompt */}
      {showGuide && !installPrompt && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-background border border-border rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-semibold">Install FlickerPlay</p>
            </div>
            <button onClick={() => setShowGuide(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            Install FlickerPlay as a desktop app for the best experience — no browser chrome, faster launch.
          </p>

          <div className="space-y-2.5">
            {/* Chrome */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50">
              <Chrome className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Google Chrome</p>
                <p className="text-xs text-muted-foreground">
                  Click the <strong>⋮</strong> menu → <strong>Save and share</strong> → <strong>Install page as app</strong>
                </p>
              </div>
            </div>

            {/* Edge */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50">
              <Globe className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Microsoft Edge</p>
                <p className="text-xs text-muted-foreground">
                  Click the <strong>⋯</strong> menu → <strong>Apps</strong> → <strong>Install this site as an app</strong>
                </p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground mt-3 text-center">
            Or look for the install icon <strong>⊕</strong> in your browser's address bar
          </p>
        </div>
      )}
    </div>
  );
}
