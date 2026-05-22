import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Removes "VJ [Name] - " prefixes and "[SITE.COM]", "_JR_" etc. suffixes from titles.
 */
export function cleanTitle(title: string): string {
  let t = title;

  // Strip trailing bracketed site tags like [WWW.LABAFILM.COM] or [TULABE.COM]
  t = t.replace(/\s*\[[^\]]*\.(com|net|org|ug)[^\]]*\]/gi, "").trim();

  // Strip "_JR_" and similar internal markers (case-insensitive)
  t = t.replace(/_JR_/gi, " ").trim();

  // Replace remaining underscores with spaces
  t = t.replace(/_/g, " ").trim();

  // Strip "VJ [Name] - " prefix
  if (t.includes(" - ")) {
    t = t.split(" - ").pop()?.trim() || t;
  }

  // Title-case if the whole string is uppercase
  if (t === t.toUpperCase() && t.length > 2) {
    t = t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }

  return t;
}
