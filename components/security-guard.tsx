"use client";

import { useEffect } from "react";

export function SecurityGuard() {
  useEffect(() => {
    // Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    // Block dev tool keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // F12
      if (key === "F12") { e.preventDefault(); return; }

      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C / Ctrl+Shift+K
      if (ctrl && shift && ["I", "J", "C", "K"].includes(key.toUpperCase())) {
        e.preventDefault();
        return;
      }

      // Ctrl+U (view source)
      if (ctrl && key.toUpperCase() === "U") { e.preventDefault(); return; }

      // Ctrl+S (save page)
      if (ctrl && key.toUpperCase() === "S") { e.preventDefault(); return; }
    };

    // Detect dev tools via window size deviance (desktop)
    const THRESHOLD = 160;
    let devToolsOpen = false;

    const detectDevTools = () => {
      const widthGap = window.outerWidth - window.innerWidth;
      const heightGap = window.outerHeight - window.innerHeight;
      const isOpen = widthGap > THRESHOLD || heightGap > THRESHOLD;

      if (isOpen && !devToolsOpen) {
        devToolsOpen = true;
        document.body.innerHTML = "";
        window.location.replace("/");
      } else if (!isOpen) {
        devToolsOpen = false;
      }
    };

    const interval = setInterval(detectDevTools, 1000);

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  return null;
}
