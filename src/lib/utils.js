import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const API_URL = import.meta.env.VITE_API_URL;

export function toImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const base = API_URL || "";
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}
