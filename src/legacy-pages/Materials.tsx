import SearchBar from "../components/SearchBar";
import { useMemo, useState } from "react";

type Row = { material: string; status: string; notes?: string };
const ROWS: Row[] = [
  { material: "Metals (gold, silver, copper, iron, tin, lead), aluminum, steel", status: "Tevila with brocha", notes: "Most food-contact metal items." },
  { material: "Glass (Pyrex, Duralex, Corelle, crystal, fiberglass)", status: "Tevila with brocha", notes: "Glass is rabbinic; minhag with brocha." },
  { material: "Glazed china, bone china, stoneware, porcelain enamel, CorningWare", status: "Tevila without brocha" },
  { material: "Teflon/enamel-coated metal, mixed materials (food-contact)", status: "Tevila without brocha", notes: "Coating changes brocha status." },
  { material: "Plastic, nylon, rubber, melamine, Formica", status: "Generally no tevila", notes: "Some are machmir to tovel without brocha." },
  { material: "Wood", status: "No tevila" },
  { material: "Stone", status: "No tevila" },
  { material: "Non-glazed earthenware", status: "No tevila" },
  { material: "Paper, bone, Styrofoam", status: "No tevila" },
];

export default function Materials() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q) return ROWS;
    const L = q.toLowerCase();
    return ROWS.filter(r =>
      r.material.toLowerCase().includes(L) ||
      r.status.toLowerCase().includes(L) ||
      (r.notes || "").toLowerCase().includes(L)
    );
  }, [q]);

  return (
    <section className="space-y-6">
      <SearchBar placeholder="Search materials…" onChange={setQ} />

      {/* Mobile: cards (no horizontal scroll) */}
      <div className="sm:hidden space-y-3">
        {filtered.map((r) => (
          <div key={r.material} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="font-semibold">{r.material}</div>
            <div className="mt-2 text-sm"><span className="font-medium">Status:</span> {r.status}</div>
            <div className="mt-1 text-sm text-gray-600">{r.notes || "—"}</div>
          </div>
        ))}
      </div>

      {/* sm+ : table */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-sm text-gray-600 border-b">
              <th className="px-4 py-3">Material</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((r) => (
              <tr key={r.material} className="hover:bg-gray-50">
                <td className="px-4 py-3">{r.material}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3 text-gray-600">{r.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && <p className="text-gray-600">No matches.</p>}
    </section>
  );
}
