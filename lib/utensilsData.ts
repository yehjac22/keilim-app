import fs from "node:fs/promises";
import path from "node:path";

import { type Category, type Need, type Utensil } from "@/src/data/utensils";

type DataSource = "google-sheets" | "local-cache" | "unavailable";

type PersistedCache = {
  updatedAt: string | null;
  items: Utensil[];
};

type GetUtensilsResult = {
  items: Utensil[];
  source: DataSource;
  updatedAt: string | null;
};

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID || "";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";
const SHEET_RANGE = process.env.SHEET_RANGE || "Sheet1!A:I1000";

const CACHE_DURATION_MS = 60 * 1000;
const BUNDLED_CACHE_PATH = path.join(process.cwd(), "data", "utensils-cache.json");
// Vercel's filesystem is read-only except /tmp — write cache there when deployed.
const WRITABLE_CACHE_PATH = process.env.VERCEL
  ? path.join("/tmp", "utensils-cache.json")
  : BUNDLED_CACHE_PATH;
const CACHE_READ_PATHS = Array.from(
  new Set(process.env.VERCEL ? [WRITABLE_CACHE_PATH, BUNDLED_CACHE_PATH] : [WRITABLE_CACHE_PATH])
);

let memoryCache: GetUtensilsResult | null = null;
let memoryCacheAt = 0;

function hasSheetsConfig(): boolean {
  return Boolean(GOOGLE_SHEETS_ID && GOOGLE_API_KEY);
}

function cleanText(value: string): string {
  if (!value) return "";
  return value.trim().replace(/\uFFFD/g, "");
}

function parseNeed(value: string): Need {
  const normalized = cleanText(value).toLowerCase();
  if (normalized === "yes" || normalized === "y" || normalized === "required") return "yes";
  if (normalized === "no" || normalized === "n" || normalized === "not required") return "no";
  return "varies";
}

function parseCategory(value: string): Category {
  const normalized = cleanText(value)
    .toLowerCase()
    .replace(/\s+/g, "-");

  return normalized || "storage-misc";
}

function parseTags(value: string): string[] | undefined {
  if (!value) return undefined;
  const tags = value
    .split(/[,;|]/g)
    .map((tag) => cleanText(tag))
    .filter(Boolean);
  return tags.length > 0 ? tags : undefined;
}

function parseUtensilRow(row: string[]): Utensil | null {
  const [
    id = "",
    name = "",
    category = "",
    tevila = "",
    brocha = "",
    notes = "",
    debates = "",
    tags = "",
    imageUrl = "",
  ] = row;

  const parsedId = cleanText(id);
  const parsedName = cleanText(name);

  if (!parsedId || !parsedName) {
    return null;
  }

  return {
    id: parsedId,
    name: parsedName,
    category: parseCategory(category),
    tevila: parseNeed(tevila),
    brocha: parseNeed(brocha),
    imageUrl: cleanText(imageUrl) || undefined,
    notes: cleanText(notes) || undefined,
    debates: cleanText(debates) || undefined,
    tags: parseTags(tags),
  };
}

function getSheetRangeCandidates(rangeValue: string): string[] {
  const raw = cleanText(rangeValue) || "Sheet1!A:I1000";
  const candidates = [raw];

  // Common env typo: missing opening quote (e.g. utensils-upload'!A:H).
  if (raw.includes("'!") && !raw.startsWith("'")) {
    candidates.push(`'${raw}`);
  }

  return Array.from(new Set(candidates));
}

async function fetchFromGoogleSheets(): Promise<Utensil[]> {
  const ranges = getSheetRangeCandidates(SHEET_RANGE);
  let lastStatus: number | null = null;

  for (const range of ranges) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${encodeURIComponent(range)}?key=${GOOGLE_API_KEY}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok) {
        lastStatus = response.status;
        continue;
      }

      const parsed = (await response.json()) as { values?: string[][] };
      const rows = parsed.values ?? [];

      if (rows.length <= 1) {
        throw new Error("Google Sheets returned no data rows");
      }

      return rows.slice(1).map(parseUtensilRow).filter((item): item is Utensil => item !== null);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(
    lastStatus ? `Google Sheets request failed (${lastStatus})` : "Google Sheets request failed"
  );
}

async function readDiskCache(): Promise<PersistedCache | null> {
  for (const cachePath of CACHE_READ_PATHS) {
    try {
      const raw = await fs.readFile(cachePath, "utf8");
      const parsed = JSON.parse(raw) as PersistedCache;

      if (!Array.isArray(parsed.items)) {
        continue;
      }

      return {
        updatedAt: parsed.updatedAt ?? null,
        items: parsed.items,
      };
    } catch {
      continue;
    }
  }

  return null;
}

async function writeDiskCache(items: Utensil[]): Promise<string> {
  const updatedAt = new Date().toISOString();
  const payload: PersistedCache = { updatedAt, items };

  await fs.mkdir(path.dirname(WRITABLE_CACHE_PATH), { recursive: true });
  const tempPath = `${WRITABLE_CACHE_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(payload, null, 2), "utf8");
  await fs.rename(tempPath, WRITABLE_CACHE_PATH);

  return updatedAt;
}

export async function getUtensils(forceRefresh = false): Promise<GetUtensilsResult> {
  const now = Date.now();
  if (!forceRefresh && memoryCache && now - memoryCacheAt < CACHE_DURATION_MS) {
    return memoryCache;
  }

  if (hasSheetsConfig()) {
    try {
      const sheetItems = await fetchFromGoogleSheets();

      if (sheetItems.length > 0) {
        let updatedAt: string;
        try {
          updatedAt = await writeDiskCache(sheetItems);
        } catch {
          // Disk write failed (e.g. read-only filesystem on Vercel) — still return Sheets data.
          updatedAt = new Date().toISOString();
        }
        memoryCache = {
          items: sheetItems,
          source: "google-sheets",
          updatedAt,
        };
        memoryCacheAt = now;
        return memoryCache;
      }
    } catch {
      // Sheets fetch failed — falls through to local cache.
    }
  }

  const cached = await readDiskCache();
  if (cached && cached.items.length > 0) {
    memoryCache = {
      items: cached.items,
      source: "local-cache",
      updatedAt: cached.updatedAt,
    };
    memoryCacheAt = now;
    return memoryCache;
  }

  memoryCache = {
    items: [],
    source: "unavailable",
    updatedAt: null,
  };
  memoryCacheAt = now;
  return memoryCache;
}
