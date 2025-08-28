// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"// Converts a string to a URL-friendly slug

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(str: string): string {
  return str
    .toString()                     // Ensure input is a string
    .toLowerCase()                  // Convert to lowercase
    .trim()                         // Remove leading/trailing whitespace
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // --- NEW: Trim - from start of text ---
    .replace(/-+$/, '');            // --- NEW: Trim - from end of text ---
}
