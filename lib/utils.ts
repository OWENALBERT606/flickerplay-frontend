import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Removes the "VJ [Name] - " prefix from movie/series titles
 */
export function cleanTitle(title: string): string {
  if (title.includes(" - ")) {
    return title.split(" - ").pop()?.trim() || title;
  }
  return title;
}
