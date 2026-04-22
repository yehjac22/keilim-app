"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import UtensilImage from "@/components/UtensilImage";
import { parseClientCachedUtensils, UTENSILS_STORAGE_KEY } from "@/lib/utensilsClientCache";
import { getCategoryMeta, type Utensil } from "@/src/data/utensils";

type UtensilDetailClientProps = {
  id: string;
  initialUtensil: Utensil | null;
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

function Badge({ label, intent }: { label: string; intent: "yes" | "no" | "varies" }) {
  const base = "inline-block rounded-xl border px-2.5 py-1 text-sm";

  if (intent === "yes") {
    return <span className={`${base} border-green-200 bg-green-100 text-green-700`}>{label}</span>;
  }

  if (intent === "no") {
    return <span className={`${base} border-red-200 bg-red-100 text-red-700`}>{label}</span>;
  }

  return <span className={`${base} border-amber-200 bg-amber-100 text-amber-800`}>{label}</span>;
}

export default function UtensilDetailClient({
  id,
  initialUtensil,
  initialSource,
  initialUpdatedAt,
}: UtensilDetailClientProps) {
  const [utensil, setUtensil] = useState<Utensil | null>(initialUtensil);
  const [source, setSource] = useState(initialSource);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt);
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null);

  const loadFromLocalStorage = useCallback(() => {
    const parsed = parseClientCachedUtensils(localStorage.getItem(UTENSILS_STORAGE_KEY));
    const cachedUtensil = parsed?.items.find((item) => item.id === id) ?? null;

    if (cachedUtensil) {
      setUtensil(cachedUtensil);
      setSource(parsed?.source || "local-storage");
      setUpdatedAt(parsed?.updatedAt || null);
      setOfflineMessage("Showing saved offline data.");
      return true;
    }

    return false;
  }, [id]);

  const refreshFromApi = useCallback(async () => {
    try {
      const response = await fetch("/api/utensils", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to refresh utensils");
      }

      const parsed = (await response.json()) as ApiResponse;
      const nextUtensil = parsed.data.find((item) => item.id === id) ?? null;

      if (!nextUtensil) {
        throw new Error("Utensil not found in live data");
      }

      setUtensil(nextUtensil);
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
  }, [id, loadFromLocalStorage]);

  useEffect(() => {
    if (!utensil) {
      loadFromLocalStorage();
    }

    void refreshFromApi();

    const onOnline = () => {
      void refreshFromApi();
    };

    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("online", onOnline);
    };
  }, [loadFromLocalStorage, refreshFromApi, utensil]);

  const categoryMeta = useMemo(
    () => (utensil ? getCategoryMeta(utensil.category) : null),
    [utensil]
  );

  if (!utensil) {
    return (
      <article className="max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold">Utensil unavailable</h1>
        <p className="text-gray-600">
          This utensil is not available in the current offline cache yet. Open the kiosk while online once to save the latest sheet data on this device.
        </p>
      </article>
    );
  }

  return (
    <article className="max-w-3xl space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
        Data source: <span className="font-semibold text-slate-800">{source}</span>
        {updatedAt ? <span> | Last update: {new Date(updatedAt).toLocaleString()}</span> : null}
      </div>

      {offlineMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {offlineMessage}
        </div>
      ) : null}

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="relative h-32 w-32 overflow-hidden rounded-3xl border border-slate-200 bg-gray-100 shadow-sm sm:h-40 sm:w-40">
          <UtensilImage
            id={utensil.id}
            name={utensil.name}
            imageUrl={utensil.imageUrl}
            sizes="(max-width: 640px) 128px, 160px"
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{utensil.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              label={
                utensil.tevila === "yes"
                  ? "Tevila: Required"
                  : utensil.tevila === "no"
                    ? "Tevila: Not Required"
                    : "Tevila: Varies"
              }
              intent={utensil.tevila}
            />
            <Badge
              label={
                utensil.brocha === "yes"
                  ? "Brocha: Yes"
                  : utensil.brocha === "no"
                    ? "Brocha: No"
                    : "Brocha: Varies"
              }
              intent={utensil.brocha}
            />
          </div>
        </div>
      </div>

      {utensil.notes ? (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-1 font-semibold">Notes</h2>
          <p className="text-gray-700">{utensil.notes}</p>
        </div>
      ) : null}

      {utensil.debates ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <h2 className="mb-1 flex items-center gap-2 font-semibold">
            <span
              className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-amber-400 font-bold leading-none text-amber-600"
              style={{ fontSize: "10px" }}
            >
              i
            </span>
            Halachic Debate
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">{utensil.debates}</p>
        </div>
      ) : null}

      {utensil.category && categoryMeta ? (
        <p className="text-sm text-gray-500">
          Category: {categoryMeta.icon ? `${categoryMeta.icon} ` : ""}{categoryMeta.label}
        </p>
      ) : null}
    </article>
  );
}