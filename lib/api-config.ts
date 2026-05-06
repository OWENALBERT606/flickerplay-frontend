/**
 * Single source of truth for the API base URL.
 * Priority: API_URL (server-only) → NEXT_PUBLIC_API_URL → Railway production URL
 */
export const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";
