"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import UtensilImage from "@/components/UtensilImage";
import { parseClientCachedUtensils, UTENSILS_STORAGE_KEY } from "@/lib/utensilsClientCache";
import { getCategoryList, getCategoryMeta, type Category, type Utensil } from "@/src/data/utensils";
import SearchBar, { type SearchSuggestion } from "@/components/SearchBar";

type HomeClientProps = {
  initialUtensils: Utensil[];
  initialSource: string;
  initialUpdatedAt: string | null;
};

type ApiResponse = {
  data: Utensil[];
  meta: {
    source: string;
    updatedAt: string | null;
    count: number;
  };
};

const SPLASH_TUTORIALS = [
  {
    id: "tutorial-1",
    title: "How To Use This Kiosk",
    duration: "2:05",
    description: "Quick walkthrough of search, categories, and utensil details.",
  },
  {
    id: "tutorial-2",
    title: "Tevilah Procedure Basics",
    duration: "3:40",
    description: "Short overview of preparation and immersion steps.",
  },
  {
    id: "tutorial-3",
    title: "Understanding Brocha Rules",
    duration: "2:50",
    description: "When a brocha is needed and where common exceptions appear.",
  },
  {
    id: "tutorial-4",
    title: "Materials Quick Guide",
    duration: "2:25",
    description: "How material type changes tevila requirements.",
  },
] as const;

function Dot({ need }: { need: "yes" | "no" | "varies" }) {
  const map = {
    yes: "bg-green-500",
    no: "bg-red-400",
    varies: "bg-amber-400",
  } as const;

  return (
    <span
      className={`inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ${map[need]}`}
      title={need}
      aria-label={need}
    />
  );
}

export default function HomeClient({
  initialUtensils,
  initialSource,
  initialUpdatedAt,
}: HomeClientProps) {
  const router = useRouter();
  const [utensils, setUtensils] = useState<Utensil[]>(initialUtensils);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [source, setSource] = useState(initialSource);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt);
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const categories = useMemo(() => getCategoryList(utensils), [utensils]);
  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);
  const hasSearchQuery = normalizedQuery.length > 0;

  const handleSearchChange = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
    if (nextQuery.trim().length === 0) {
      setActiveCategory("all");
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    const parsed = parseClientCachedUtensils(localStorage.getItem(UTENSILS_STORAGE_KEY));
    if (parsed) {
      setUtensils(parsed.items);
      setSource(parsed.source || "local-storage");
      setUpdatedAt(parsed.updatedAt || null);
      setOfflineMessage("Showing saved offline data.");
    }
  }, []);

  const refreshFromApi = useCallback(async () => {
    try {
      const response = await fetch("/api/utensils", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to refresh utensils");
      }

      const parsed = (await response.json()) as ApiResponse;
      if (!Array.isArray(parsed.data) || parsed.data.length === 0) {
        return;
      }

      setUtensils(parsed.data);
      setSource(parsed.meta.source);
      setUpdatedAt(parsed.meta.updatedAt);
      setOfflineMessage(null);
      localStorage.setItem(
        UTENSILS_STORAGE_KEY,
        JSON.stringify({
          items: parsed.data,
          source: parsed.meta.source,
          updatedAt: parsed.meta.updatedAt,
        })
      );
    } catch {
      loadFromLocalStorage();
    }
  }, [loadFromLocalStorage]);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    loadFromLocalStorage();
    void refreshFromApi();

    const interval = window.setInterval(() => {
      void refreshFromApi();
    }, 60_000);

    const onOnline = () => {
      setIsOnline(true);
      void refreshFromApi();
    };

    const onOffline = () => {
      setIsOnline(false);
      setOfflineMessage("Device is offline. Using saved data.");
    };

    const onNativeCacheUpdated = () => {
      loadFromLocalStorage();
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("keilim-native-cache-updated", onNativeCacheUpdated);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("keilim-native-cache-updated", onNativeCacheUpdated);
    };
  }, [loadFromLocalStorage, refreshFromApi]);

  const filtered = useMemo(() => {
    let list = utensils;

    if (activeCategory !== "all") {
      list = list.filter((utensil) => utensil.category === activeCategory);
    }

    if (normalizedQuery) {
      list = list.filter(
        (utensil) =>
          utensil.name.toLowerCase().includes(normalizedQuery) ||
          (utensil.tags || []).some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
          (utensil.notes || "").toLowerCase().includes(normalizedQuery) ||
          (utensil.debates || "").toLowerCase().includes(normalizedQuery)
      );
    }

    return list;
  }, [utensils, normalizedQuery, activeCategory]);

  const categoryCounts = useMemo(() => {
    const searchFiltered = normalizedQuery
      ? utensils.filter(
          (utensil) =>
            utensil.name.toLowerCase().includes(normalizedQuery) ||
            (utensil.tags || []).some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
            (utensil.notes || "").toLowerCase().includes(normalizedQuery) ||
            (utensil.debates || "").toLowerCase().includes(normalizedQuery)
        )
      : utensils;

    const counts: Record<string, number> = { all: searchFiltered.length };
    for (const category of categories) {
      counts[category] = searchFiltered.filter((utensil) => utensil.category === category).length;
    }

    return counts;
  }, [categories, utensils, normalizedQuery]);

  const searchSuggestions = useMemo<SearchSuggestion[]>(() => {
    return utensils
      .map((utensil) => ({
        label: utensil.name,
        value: utensil.id,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [utensils]);

  const handleSuggestionSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      if (!suggestion.value) {
        return;
      }

      router.push(`/utensil/${suggestion.value}`);
    },
    [router]
  );

  const handleSearchSubmit = useCallback(
    (submittedQuery: string) => {
      const normalizedSubmittedQuery = submittedQuery.trim().toLowerCase();
      if (!normalizedSubmittedQuery) {
        return;
      }

      const exactMatch = utensils.find((utensil) => utensil.name.toLowerCase() === normalizedSubmittedQuery);
      if (exactMatch) {
        router.push(`/utensil/${exactMatch.id}`);
      }
    },
    [utensils, router]
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Utensil Lookup</h1>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isOnline ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
          }`}
        >
          {isOnline ? "Online" : "Offline"}
        </div>
      </div>

      <SearchBar
        placeholder="Search utensils, halachos, materials (e.g., air fryer, teflon, brocha)..."
        onChange={handleSearchChange}
        suggestions={searchSuggestions}
        onSelectSuggestion={handleSuggestionSelect}
        onSubmitQuery={handleSearchSubmit}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">Tutorial Videos</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            Placeholders
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {SPLASH_TUTORIALS.map((video) => (
            <article key={video.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-sky-100 to-emerald-100 text-sm font-semibold text-slate-700">
                Video Placeholder
              </div>

              <div className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{video.title}</h3>
                  <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {video.duration}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{video.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
        Data source: <span className="font-semibold text-slate-800">{source}</span>
        {updatedAt ? <span> | Last update: {new Date(updatedAt).toLocaleString()}</span> : null}
      </div>

      {offlineMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {offlineMessage}
        </div>
      ) : null}

      {hasSearchQuery ? (
        <>
          <div className="-mx-3 overflow-x-auto px-3 no-scrollbar">
            <div className="flex items-center gap-2 pb-1">
              <button
                onClick={() => setActiveCategory("all")}
                className={`min-h-10 whitespace-nowrap rounded-xl border px-3 py-1.5 text-sm transition ${
                  activeCategory === "all"
                    ? "border-slate-800 bg-slate-800 text-white shadow"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                All <span className="ml-1 text-xs opacity-70">{categoryCounts.all}</span>
              </button>

              {categories.map((category) => {
                const meta = getCategoryMeta(category);
                const active = activeCategory === category;
                const count = categoryCounts[category] || 0;

                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(active ? "all" : category)}
                    className={`min-h-10 whitespace-nowrap rounded-xl border px-3 py-1.5 text-sm transition ${
                      active
                        ? "border-slate-800 bg-slate-800 text-white shadow"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    } ${count === 0 ? "opacity-40" : ""}`}
                  >
                    {meta.label} <span className="ml-1 text-xs opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeCategory !== "all" && (
            <p className="-mt-2 text-sm text-gray-500">{getCategoryMeta(activeCategory).description}</p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((utensil) => (
              <Link
                key={utensil.id}
                href={`/utensil/${utensil.id}`}
                className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/10" aria-hidden />
                  <UtensilImage
                    id={utensil.id}
                    name={utensil.name}
                    imageUrl={utensil.imageUrl}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="space-y-2 p-4">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-lg font-semibold leading-snug group-hover:underline">
                      {utensil.name}
                    </h3>
                    <span className="text-xs text-gray-500">{getCategoryMeta(utensil.category).label}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="inline-flex items-center gap-1.5 text-gray-500">
                      <span>Tevila</span>
                      <Dot need={utensil.tevila} />
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-gray-500">
                      <span>Brocha</span>
                      <Dot need={utensil.brocha} />
                    </div>
                  </div>

                  {utensil.notes && <p className="line-clamp-2 text-sm text-gray-600">{utensil.notes}</p>}

                  {utensil.debates && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700">
                      <span
                        className="inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border border-amber-400 font-bold leading-none text-amber-600"
                        style={{ fontSize: "9px" }}
                      >
                        i
                      </span>
                      <span>Halachic debate - tap for details</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-lg text-gray-500">{utensils.length === 0 ? "No utensil data available yet." : "No matches found."}</p>
              {utensils.length === 0 ? (
                <p className="mt-1 text-sm text-gray-400">
                  Connect to the internet once so the kiosk can download the sheet and save an offline copy.
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-400">
                  Try a different term, or{" "}
                  <button
                    className="underline decoration-sky-400"
                    onClick={() => {
                      setQuery("");
                      setActiveCategory("all");
                    }}
                  >
                    reset filters
                  </button>
                  .
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t pt-4 text-xs text-gray-500">
            <span className="font-medium">Legend:</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" /> Required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400" /> Not required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" /> Varies
            </span>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
          Start typing in the search box to see utensil listings.
        </div>
      )}
    </section>
  );
}
