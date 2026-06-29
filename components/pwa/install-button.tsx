"use client";

import { useState, useEffect, useRef } from "react";
import { Download, X, Smartphone, Share, MoreVertical } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __pwaInstallPrompt: BeforeInstallPromptEvent | null;
  }
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

export function InstallButton() {
  const [mounted, setMounted]         = useState(false);
  const [canInstall, setCanInstall]   = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling]   = useState(false);
  const [showGuide, setShowGuide]     = useState(false);
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

    // Pick up prompt captured by the inline <head> script before React loaded
    if (window.__pwaInstallPrompt) {
      setCanInstall(true);
    }

    // Listen for prompt becoming available
    const onReady = () => setCanInstall(true);
    document.addEventListener("pwa-prompt-ready", onReady);

    // Listen for successful install
    const onInstalled = () => {
      setCanInstall(false);
      setIsInstalled(true);
      setShowGuide(false);
    };
    document.addEventListener("pwa-installed", onInstalled);

    // On first load the SW needs a few seconds to install before the browser
    // will fire beforeinstallprompt. Re-check once after 3 s.
    const retry = setTimeout(() => {
      if (window.__pwaInstallPrompt) setCanInstall(true);
    }, 3000);

    return () => {
      document.removeEventListener("pwa-prompt-ready", onReady);
      document.removeEventListener("pwa-installed", onInstalled);
      clearTimeout(retry);
    };
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
    const prompt = window.__pwaInstallPrompt;
    if (prompt) {
      setInstalling(true);
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          window.__pwaInstallPrompt = null;
          setCanInstall(false);
        }
      } finally {
        setInstalling(false);
      }
    } else {
      setShowGuide((s) => !s);
    }
  };

  if (!mounted || isInstalled) return null;

  const ios     = isIOS();
  const android = isAndroid();

  return (
    <div className="relative" ref={guideRef}>
      <button
        onClick={handleClick}
        disabled={installing}
        className={`
          flex items-center gap-1.5 text-white text-xs font-bold px-3 h-8 rounded-lg
          transition-all duration-200 shrink-0 cursor-pointer select-none
          bg-orange-500 hover:bg-orange-600 active:scale-95 shadow-lg shadow-orange-500/30
          ${installing ? "opacity-70 cursor-wait" : ""}
        `}
        title="Install FlickerPlay app"
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
              <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
            )}
          </>
        )}
      </button>

      {/* Manual guide — shown only when browser hasn't provided the native prompt */}
      {showGuide && !canInstall && (
        <div className="absolute right-0 top-full mt-2 z-[100] w-72 bg-background border border-border rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-semibold">Install FlickerPlay</p>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {ios ? (
            /* iOS Safari — Add to Home Screen */
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Install FlickerPlay on your iPhone or iPad:
              </p>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border">
                <Share className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold mb-0.5">Step 1</p>
                  <p className="text-xs text-muted-foreground">
                    Tap the <strong>Share</strong> button (box with arrow) at the bottom of Safari
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border">
                <Download className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold mb-0.5">Step 2</p>
                  <p className="text-xs text-muted-foreground">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : android ? (
            /* Android — Chrome menu */
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Install FlickerPlay on your Android device:
              </p>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border">
                <MoreVertical className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold mb-0.5">Chrome</p>
                  <p className="text-xs text-muted-foreground">
                    Tap <strong>⋮</strong> (menu) → <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop browser */
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Install FlickerPlay as a desktop app:
              </p>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border">
                <MoreVertical className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold mb-0.5">Chrome</p>
                  <p className="text-xs text-muted-foreground">
                    Click <strong>⋮</strong> → <strong>Save and share</strong> → <strong>Install page as app</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border">
                <MoreVertical className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold mb-0.5">Edge</p>
                  <p className="text-xs text-muted-foreground">
                    Click <strong>⋯</strong> → <strong>Apps</strong> → <strong>Install this site as an app</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
