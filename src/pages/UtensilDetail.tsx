import { useParams, Link } from "react-router-dom";
import { UTENSILS } from "../data/utensils";
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

  return (
    <article className="max-w-3xl space-y-5">
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-2xl bg-gray-100 border flex items-center justify-center overflow-hidden">
            {utensilImageMap[u.id] ? (
                <img
                src={utensilImageMap[u.id]}
                alt={u.name}
                className="object-contain w-full h-full"
                />
            ) : (
                <span className="text-gray-400 text-2xl">🖼️</span>
            )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{u.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge label="Tevila" intent={u.tevila} />
            <Badge label="Brocha" intent={u.brocha} />
          </div>
        </div>
      </div>

      <p className="text-gray-700">
        For many utensils, the status depends on <Link className="underline decoration-sky-400" to="/materials">material</Link> and typical use (e.g., table vs. storage, raw vs. ready-to-eat). See notes below and consult a Rav for specific situations.
      </p>

      {u.notes && (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-1">Notes</h2>
          <p className="text-gray-700">{u.notes}</p>
        </div>
      )}
    </article>
  );
}
