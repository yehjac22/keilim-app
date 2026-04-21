import { useParams } from "react-router-dom";
import { UTENSILS } from "../data/utensils";
import { getCategoryMeta } from "../data/utensils";
import utensilImageMap from "../utils/utensilImages";


function Badge({ label, intent }: { label: string; intent: "yes"|"no"|"varies" }) {
  const base = "inline-block rounded-xl px-2.5 py-1 text-sm border";
  if (intent === "yes") return <span className={`${base} bg-green-100 text-green-700 border-green-200`}>{label}</span>;
  if (intent === "no") return <span className={`${base} bg-red-100 text-red-700 border-red-200`}>{label}</span>;
  return <span className={`${base} bg-amber-100 text-amber-800 border-amber-200`}>{label}</span>;
}

export default function UtensilDetail() {
  const { id } = useParams();
  const u = UTENSILS.find(x => x.id === id);
  if (!u) return <p>Not found.</p>;

  const categoryMeta = getCategoryMeta(u.category);

  return (
    <article className="max-w-3xl space-y-5">
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-2xl bg-gray-100 border overflow-hidden">
            {utensilImageMap[u.id] && (
                <img
                src={utensilImageMap[u.id]}
                alt={u.name}
                className="object-contain w-full h-full"
                />
            )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{u.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge label={u.tevila === "yes" ? "Tevila: Required" : u.tevila === "no" ? "Tevila: Not Required" : "Tevila: Varies"} intent={u.tevila} />
            <Badge label={u.brocha === "yes" ? "Brocha: Yes" : u.brocha === "no" ? "Brocha: No" : "Brocha: Varies"} intent={u.brocha} />
          </div>
        </div>
      </div>

      {u.notes && (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-1">Notes</h2>
          <p className="text-gray-700">{u.notes}</p>
        </div>
      )}

      {u.debates && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <h2 className="font-semibold mb-1 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-amber-400 text-amber-600 font-bold leading-none flex-shrink-0" style={{ fontSize: "10px" }}>i</span>
            Halachic Debate
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">{u.debates}</p>
        </div>
      )}

      {/* Category */}
      {u.category && (
        <p className="text-sm text-gray-500">
          Category: {categoryMeta.icon ? `${categoryMeta.icon} ` : ""}{categoryMeta.label}
        </p>
      )}
    </article>
  );
}
