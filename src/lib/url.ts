// src/lib/url.ts

/**
 * Returns the absolute URL for the current environment.
 *
 * - In development, it defaults to `http://localhost:3000`.
 * - On Vercel, it uses the `VERCEL_URL` environment variable.
 * - You can override it with a `NEXT_PUBLIC_SITE_URL` environment variable.
 *
 * @param {string} [path=""] - Optional path to append to the base URL.
 * @returns {string} The absolute URL.
 */
export const absoluteUrl = (path: string = ""): string => {
  // 1. Check for a user-defined public site URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL}${path}`;
  }

  // 2. Check for Vercel's system-provided URL
  // Vercel provides this variable automatically, which can be a production domain or a preview URL.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${path}`;
  }

  // 3. Fallback to localhost for local development
  return `http://localhost:${process.env.PORT || 3000}${path}`;
};