/**
 * The artifact is served under a base path (`/` in production, but the dev
 * proxy may mount it elsewhere). Vite exposes that prefix as BASE_URL and it
 * always ends with a slash.
 */
const BASE = import.meta.env.BASE_URL;

/** Build a URL to a file in `public/`, e.g. asset("images/memoli-logo.png"). */
export function asset(relativePath: string): string {
  return `${BASE}${relativePath.replace(/^\//, "")}`;
}

/** Build a URL to an API endpoint, e.g. api("settings") -> "/api/settings". */
export function api(relativePath: string): string {
  return `${BASE}api/${relativePath.replace(/^\//, "")}`;
}
