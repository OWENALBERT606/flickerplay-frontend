"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface PlayerModalProps {
  children: React.ReactNode;
  backHref?: string;
}

export function PlayerModal({ children, backHref }: PlayerModalProps) {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Desktop — render inline, no changes
  if (!isMobile) return <>{children}</>;

  // Mobile / tablet — fixed full-screen overlay
  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Close button */}
      <button
        onClick={() => (backHref ? router.push(backHref) : router.back())}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm
          border border-white/20 flex items-center justify-center text-white
          hover:bg-black/90 transition-colors"
        aria-label="Close player"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Player centred vertically */}
      <div className="flex-1 flex items-center justify-center w-full">
        {children}
      </div>
    </div>
  );
}
