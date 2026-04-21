import type { Utensil } from "@/src/data/utensils";

export const UTENSILS_STORAGE_KEY = "keilim-utensils-cache-v1";

export type ClientCachedUtensils = {
  items: Utensil[];
  source: string;
  updatedAt: string | null;
};

export function parseClientCachedUtensils(raw: string | null): ClientCachedUtensils | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as ClientCachedUtensils;

    if (!Array.isArray(parsed.items) || parsed.items.length === 0) {
      return null;
    }

    return {
      items: parsed.items,
      source: parsed.source || "local-storage",
      updatedAt: parsed.updatedAt || null,
    };
  } catch {
    return null;
  }
}