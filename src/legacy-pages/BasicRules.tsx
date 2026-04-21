import { useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import { Link } from "react-router-dom";

const RULES = [
  "Utensils requiring tevila with a brocha: direct food-contact items made of metal (aluminum, brass, copper, gold, iron, lead, silver/silverplate, steel, tin) or glass (incl. Pyrex, Duralex, Corelle).",
  "Utensils requiring tevila without a brocha: glazed china, bone china, stoneware, CorningWare, porcelain enamel, and some combinations like Teflon/enamel-coated metal.",
  "No tevila required: plastic, wood, stone, paper, bone, Styrofoam, and non-glazed earthenware.",
  "Combinations: Any piece of equipment that includes multiple materials, we follow the material that actually comes into contact with the food. If more than one material comes into contact with the food, we follow the more stringent material (e.g. metal over plastic).",
  "Glazed: If the vessel is coated with metal or glass, even if only coated on the inside, one should toivel without a brocha. If it is only coated on the outside, no tevila is required. If a metal or glass utensil is coated with earthenware, Teflon or enamel, one should toivel without a brocha.",
  "Painted: Metal or glass equipment that was painted still requires tevila with a brocha since paint does not change the status of the equipment.",
  "Non-food items made of metal/glass (e.g., craft knife) → no tevila even if occasionally used with food.",
  "Metal/glass items without direct contact (e.g., can opener/corkscrew) → no tevila.",
  "Storage vessels not brought to the table are generally exempt.",
  "Items used exclusively with inedible raw food (e.g., some cookie cutters) may be exempt.",
  "Borrowed or rented utensils from a non-Jew do not require tevila; purchased/owned ones do.",
  "Used items bought from a non-Jew should be kashered before tevila.",
  "If tevila will damage an item (e.g., internal electronics), do not immerse; ask a Rav about alternatives.",
  "Food prepared in an untoveled utensil is kosher after the fact; transfer to toveled dishes for serving.",
];

export default function BasicRules() {
  const [q, setQ] = useState("");
  const filt = useMemo(() => {
    if (!q) return RULES;
    const L = q.toLowerCase();
    return RULES.filter(r => r.toLowerCase().includes(L));
  }, [q]);

  return (
    <section className="space-y-6">
      <SearchBar placeholder="Search basic rules…" onChange={setQ} />
      <ol className="space-y-3">
        {filt.map((r, i) => (
          <li key={i} className="rounded-2xl border bg-white p-4 shadow-sm">
            <span className="font-semibold mr-2">{i + 1}.</span>
            <span className="text-gray-800">{r}</span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-gray-600">
        See <Link className="underline decoration-sky-400" to="/materials">Materials</Link> for specifics and examples.
      </p>
    </section>
  );
}
