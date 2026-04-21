import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { UTENSILS, getCategoryList, getCategoryMeta } from "../data/utensils";
import type { Category } from "../data/utensils";
import { useMemo, useState } from "react";
import utensilImageMap from "../utils/utensilImages";

function Dot({ need }: { need: "yes" | "no" | "varies" }) {
  const map = {
    yes: "bg-green-500",
    no: "bg-red-400",
    varies: "bg-amber-400",
  } as const;
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${map[need]}`}
      title={need}
      aria-label={need}
    />
  );
}

export default function Home() {
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<Category | "all">("all");
  const allCategories = useMemo(() => getCategoryList(UTENSILS), []);

  const filtered = useMemo(() => {
    let list = UTENSILS;

    // category filter
    if (activeCat !== "all") {
      list = list.filter((u) => u.category === activeCat);
    }

    // search filter
    const L = q.trim().toLowerCase();
    if (L) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(L) ||
          (u.tags || []).some((t) => t.toLowerCase().includes(L)) ||
          (u.notes || "").toLowerCase().includes(L) ||
          (u.debates || "").toLowerCase().includes(L)
      );
    }

    return list;
  }, [q, activeCat]);

  // Count items per category (for badges), respecting search
  const catCounts = useMemo(() => {
    const L = q.trim().toLowerCase();
    const searchFiltered = L
      ? UTENSILS.filter(
          (u) =>
            u.name.toLowerCase().includes(L) ||
            (u.tags || []).some((t) => t.toLowerCase().includes(L)) ||
            (u.notes || "").toLowerCase().includes(L) ||
            (u.debates || "").toLowerCase().includes(L)
        )
      : UTENSILS;

    const counts: Record<string, number> = { all: searchFiltered.length };
    for (const cat of allCategories) {
      counts[cat] = searchFiltered.filter((u) => u.category === cat).length;
    }
    return counts;
  }, [allCategories, q]);

  return (
    <section className="space-y-5">
      {/* Search */}
      <SearchBar
        placeholder="Search utensils, halachos, materials (e.g., 'air fryer', 'teflon', 'brocha')…"
        onChange={setQ}
      />

      {/* Category Pills — scrollable on mobile */}
      <div className="-mx-3 px-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 pb-1">
          <button
            onClick={() => setActiveCat("all")}
            className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-sm border transition
              ${activeCat === "all"
                ? "bg-slate-800 text-white border-slate-800 shadow"
                : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
          >
            All{" "}
            <span className="ml-1 text-xs opacity-70">{catCounts["all"]}</span>
          </button>

          {allCategories.map((cat) => {
            const meta = getCategoryMeta(cat);
            const active = activeCat === cat;
            const count = catCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(active ? "all" : cat)}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-sm border transition
                  ${active
                    ? "bg-slate-800 text-white border-slate-800 shadow"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                  } ${count === 0 ? "opacity-40" : ""}`}
              >
                <span className="mr-1">{meta.icon}</span>
                {meta.label}{" "}
                <span className="ml-1 text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active category description */}
      {activeCat !== "all" && (
        <p className="text-sm text-gray-500 -mt-2">
          {getCategoryMeta(activeCat).description}
        </p>
      )}

      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u) => (
          <Link
            key={u.id}
            to={`/utensil/${u.id}`}
            className="group rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start gap-3">
              {/* Image */}
              <div className="w-10 h-10 rounded-xl bg-gray-100 border flex-shrink-0 overflow-hidden">
                {utensilImageMap[u.id] && (
                  <img
                    src={utensilImageMap[u.id]}
                    alt={u.name}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold leading-snug group-hover:underline truncate">
                  {u.name}
                </h3>

                {/* Category chip (subtle) */}
                <span className="text-xs text-gray-400">
                  {getCategoryMeta(u.category).label}
                </span>
              </div>

              {/* Tevila + Brocha indicators */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">Tevila</span>
                  <Dot need={u.tevila} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">Brocha</span>
                  <Dot need={u.brocha} />
                </div>
              </div>
            </div>

            {/* Notes preview */}
            {u.notes && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {u.notes}
              </p>
            )}

            {/* Debate indicator */}
            {u.debates && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-amber-400 text-amber-600 font-bold leading-none" style={{ fontSize: "9px" }}>i</span>
                <span>Halachic debate — tap for details</span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No matches found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Try a different term, or{" "}
            <button
              className="underline decoration-sky-400"
              onClick={() => {
                setQ("");
                setActiveCat("all");
              }}
            >
              reset filters
            </button>
            .
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 border-t pt-4">
        <span className="font-medium">Legend:</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" /> Required</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400" /> Not required</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" /> Varies</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-amber-400 text-amber-600 font-bold leading-none" style={{ fontSize: "9px" }}>i</span>
          Halachic debate
        </span>
      </div>
    </section>
  );
}