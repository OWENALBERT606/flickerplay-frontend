"use client";

import { useEffect } from "react";

export function SecurityGuard() {
  useEffect(() => {
    // Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    // Block common dev-tool keyboard shortcuts (desktop only)
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      if (e.key === "F12") { e.preventDefault(); return; }
      if (ctrl && shift && ["I", "J", "C", "K"].includes(e.key.toUpperCase())) { e.preventDefault(); return; }
      if (ctrl && e.key.toUpperCase() === "U") { e.preventDefault(); return; }
      if (ctrl && e.key.toUpperCase() === "S") { e.preventDefault(); return; }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
