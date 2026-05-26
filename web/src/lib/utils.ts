import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeDivide(num: number, denom: number, fallback = 0): number {
  if (!isFinite(num) || !isFinite(denom) || denom === 0) return fallback;
  const result = num / denom;
  return isFinite(result) ? result : fallback;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function debounce<T extends (...args: never[]) => unknown>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
