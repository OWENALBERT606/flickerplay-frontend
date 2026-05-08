"use client";

import { useState, useEffect, useRef } from "react";
import { Download, X, Monitor, Chrome, Globe } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [mounted, setMounted]             = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled]     = useState(false);
  const [showGuide, setShowGuide]         = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Already running as installed PWA — hide the button
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
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") setInstallPrompt(null);
    } else {
      setShowGuide(s => !s);
    }
  };

  // Don't render until client-side hydration is complete
  if (!mounted) return null;
  // Hide if already installed as PWA
  if (isInstalled) return null;

  return (
    <div className="relative" ref={guideRef}>
      {/* Always-visible orange button */}
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold px-3 h-8 rounded-lg transition-colors shrink-0 cursor-pointer"
        title="Install FlickerPlay as a desktop app"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>Download App</span>
      </button>

      {/* Install guide dropdown */}
      {showGuide && (
        <div className="absolute right-0 top-full mt-2 z-[100] w-72 bg-background border border-border rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-semibold">Install FlickerPlay</p>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Install FlickerPlay as a desktop app for the best experience — no browser chrome, faster launch, works offline.
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

          <p className="text-[10px] text-muted-foreground mt-3 text-center">
            Or look for the <strong>⊕</strong> install icon in your browser's address bar
          </p>
        </div>
      )}
    </div>
  );
}
