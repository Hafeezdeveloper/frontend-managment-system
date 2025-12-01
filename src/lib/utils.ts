import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID for a new item in an array
 * @param items Array of items with id property
 * @returns A unique ID number
 */
export function generateUniqueId(items: { id: number }[]): number {
  if (items.length === 0) {
    return 1;
  }

  try {
    const validIds = items
      .map((item) => item.id)
      .filter((id) => typeof id === "number" && !isNaN(id) && isFinite(id));

    if (validIds.length === 0) {
      return 1;
    }

    const maxId = Math.max(...validIds);
    return maxId + 1;
  } catch (error) {
    // Fallback to timestamp-based ID if anything goes wrong
    return Date.now() + Math.floor(Math.random() * 1000);
  }
}

/**
 * Generate a unique string ID
 * @param prefix Optional prefix for the ID
 * @returns A unique string ID
 */
export function generateUniqueStringId(prefix: string = ""): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}
