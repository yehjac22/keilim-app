import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { UTENSILS } from "../data/utensils";
import { useMemo, useState } from "react";
import utensilImageMap from "../utils/utensilImages";


function Pill({ need }: { need: "yes" | "no" | "varies" }) {
  const map = {
    yes: { text: "✓", cls: "bg-green-100 text-green-700 border-green-200" },
    no: { text: "✗", cls: "bg-red-100 text-red-700 border-red-200" },
    varies: { text: "—", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  } as const;
  const { text, cls } = map[need];
  return <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm ${cls}`} title={need} aria-label={need}>{text}</span>;
}

export default function Home() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const L = q.trim().toLowerCase();
    if (!L) return UTENSILS;
    return UTENSILS.filter(u =>
      u.name.toLowerCase().includes(L) ||
      (u.tags || []).some(t => t.toLowerCase().includes(L))
    );
  }, [q]);

  return (
    <section className="space-y-6">
      {/* Search */}
      <SearchBar placeholder="Search utensils (e.g., ‘pan’, ‘corelle’, ‘kiddush cup’)…" onChange={setQ} autoFocus />

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 tv:grid-cols-4">
        {filtered.map((u) => (
          <Link
            key={u.id}
            to={`/utensil/${u.id}`}
            className="group rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold group-hover:underline">{u.name}</h3>
                <div className="w-10 h-10 rounded-xl bg-gray-100 border flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {utensilImageMap[u.id] ? (
                        <img
                        src={utensilImageMap[u.id]}
                        alt={u.name}
                        // The object-cover and w-full/h-full are fine here, as the parent div is constrained
                        className="object-cover w-full h-full"
                        />
                    ) : (
                        // Render fallback icon ONLY if no image exists
                        <span className="text-gray-400">🖼️</span>
                    )}
                    </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tevila</span>
                <Pill need={u.tevila} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Brocha</span>
                <Pill need={u.brocha} />
              </div>
            </div>

            {u.notes && <p className="mt-3 text-sm text-gray-600">{u.notes}</p>}
          </Link>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-gray-600">No matches. Try a different term.</p>}
    </section>
  );
}
