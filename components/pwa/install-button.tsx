"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled]     = useState(false);

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Hide button if app gets installed
    window.addEventListener("appinstalled", () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  // Only render when the browser has fired beforeinstallprompt and app isn't installed
  if (!installPrompt || isInstalled) return null;

  return (
    <Button
      onClick={handleInstall}
      size="sm"
      className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5 text-xs font-semibold px-3 h-8"
      title="Install FlickerPlay as a desktop app"
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Download App</span>
      <span className="sm:hidden">Install</span>
    </Button>
  );
}
