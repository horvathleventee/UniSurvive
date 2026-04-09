import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCount(count: number, singular: string, plural?: string) {
  if (count === 1) {
    return `1 ${singular}`;
  }

  return `${count} ${plural ?? `${singular}k`}`;
}

export function safeAverage(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
