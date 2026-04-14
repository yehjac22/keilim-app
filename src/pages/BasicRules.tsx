import { useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  Each rule has a short descriptive title and belongs to a group.    */
/*  Groups render as readable sections; search surfaces individual    */
/*  cards with the title bolded so users can scan quickly.            */
/* ------------------------------------------------------------------ */

type Rule = { title: string; text: string; group: string };

const RULES: Rule[] = [
  // ——— Materials & Tevila Status ———
  {
    group: "Materials & Tevila Status",
    title: "Metals — tevila with brocha",
    text: "Direct food-contact items made of metal require tevila with a brocha. This includes gold, silver, copper, iron, tin, lead, aluminum, brass, steel, silverplate, stainless steel, chrome, pewter, and cast iron.",
  },
  {
    group: "Materials & Tevila Status",
    title: "Glass — tevila with brocha",
    text: "Glass utensils require tevila with a brocha (rabbinically, since glass can be melted and reformed like metal). This includes Pyrex, Duralex, Corelle, crystal, and fiberglass.",
  },
  {
    group: "Materials & Tevila Status",
    title: "Glazed ceramics — tevila without brocha",
    text: "Glazed china, bone china, stoneware, CorningWare, and porcelain enamel require tevila without a brocha. Sephardi poskim may hold that porcelain does not require tevila at all.",
  },
  {
    group: "Materials & Tevila Status",
    title: "Coated metals — tevila without brocha",
    text: "Teflon-coated or enamel-coated metal utensils require tevila without a brocha. The coating changes the brocha status but does not remove the tevila requirement.",
  },
  {
    group: "Materials & Tevila Status",
    title: "Plastic, wood, rubber — no tevila",
    text: "Plastic, nylon, rubber, melamine, Formica, wood, stone, paper, bone, Styrofoam, and non-glazed earthenware do not require tevila. Some are machmir to tovel plastic without a brocha, but the widespread minhag is to exempt it entirely.",
  },
  {
    group: "Materials & Tevila Status",
    title: "Painted metal or glass",
    text: "Metal or glass equipment that was painted still requires tevila with a brocha — paint does not change the halachic status of the material.",
  },

  // ——— Combination Materials ———
  {
    group: "Combinations & Coatings",
    title: "Mixed materials — follow the food-contact layer",
    text: "For equipment with multiple materials, follow the material that actually contacts the food. If more than one material touches the food, follow the more stringent one (e.g., metal over plastic).",
  },
  {
    group: "Combinations & Coatings",
    title: "Glazed on inside vs. outside",
    text: "If a vessel is coated with metal or glass on the inside, tovel without a brocha. If coated only on the outside, no tevila is required. If a metal or glass utensil is coated with earthenware, Teflon, or enamel, tovel without a brocha.",
  },
  {
    group: "Combinations & Coatings",
    title: "Plastic/wood with metal parts",
    text: "A utensil made of wood or plastic requires tevila if any metal is attached to it, provided the metal touches the food and is vital for the utensil's use. A utensil made of separable parts requires tevila only for its metal parts.",
  },

  // ——— What Requires Tevila ———
  {
    group: "What Requires Tevila",
    title: "Direct food contact required",
    text: "Tevila is only required for utensils that come into direct contact with food during preparation or consumption. Indirect items (can opener, corkscrew, knife sharpener, stovetop grates) do not require tevila.",
  },
  {
    group: "What Requires Tevila",
    title: "Ready-to-eat vs. raw food",
    text: "Tevila is primarily required for utensils that contact food that is 'ready to eat' (flatware, plates) or that bring food to its ready-to-eat state (pots, pans). If a utensil is only used with raw, inedible food, it may be exempt or require tevila without a brocha — consult a Rav.",
  },
  {
    group: "What Requires Tevila",
    title: "Non-food items — no tevila",
    text: "Non-food items made of metal or glass (e.g., a craft knife) do not require tevila, even if occasionally used with food. However, if designated for food use, tevila is required.",
  },
  {
    group: "What Requires Tevila",
    title: "Storage vessels",
    text: "Containers used only for storage and never brought to the table should be immersed without a brocha. If also used for serving at the table (e.g., a pitcher), tevila with a brocha is required.",
  },
  {
    group: "What Requires Tevila",
    title: "Pot covers and lids",
    text: "A pot cover or lid requires tevila (with a brocha for metal or glass) because steam that rises and touches the cover is considered direct food contact.",
  },

  // ——— Electric Appliances ———
  {
    group: "Electric Appliances",
    title: "Electric appliances — general rule",
    text: "Metal or glass parts that contact food require tevila. The motor, base, and electrical housing do not. Most poskim reject the view that plug-in appliances are exempt as 'attached to the ground.' The cord and plug generally do not need immersion.",
  },
  {
    group: "Electric Appliances",
    title: "Appliances that may break from immersion",
    text: "If immersion will ruin the appliance, consult a Rav. Common solutions: (a) have a Jewish technician disassemble and reassemble the metal parts (creating a 'new keili'); (b) give the appliance as a gift to a non-Jew and borrow it back.",
  },
  {
    group: "Electric Appliances",
    title: "Drying after immersion",
    text: "After toveling an electric appliance, let it dry thoroughly for at least 48 hours before use. A blow-dryer helps eliminate internal moisture and reduces the chance of damage.",
  },

  // ——— Disposables & Bottles ———
  {
    group: "Disposables & Bottles",
    title: "Disposable aluminum pans",
    text: "According to Rav Moshe Feinstein, standard disposable pans designed for one-time use are not keilim and are exempt. CRC agrees regardless of reuse. STAR-K rules: without a brocha for single use, with a brocha for multiple uses. Sturdier trays may have a stricter status.",
  },
  {
    group: "Disposables & Bottles",
    title: "Glass drink bottles (Snapple etc.)",
    text: "Rav Moshe Feinstein holds the Jew who opens the bottle is considered the creator of the keili — no tevila needed. Rav Hershel Schachter holds one must pour into another vessel. Sridei Esh suggests having in mind not to acquire the bottle. Follow your Rav.",
  },
  {
    group: "Disposables & Bottles",
    title: "Cans purchased with food",
    text: "If a metal or glass container was bought filled with food and subsequently emptied by a Jew, it generally does not require tevila. If you plan to reuse the container, tevila may be required — a metal container should not be reused without tevila.",
  },

  // ——— Ownership & Transfers ———
  {
    group: "Ownership & Transfers",
    title: "Borrowed or rented utensils",
    text: "Utensils borrowed or rented from a non-Jew do not require tevila. Once purchased or fully owned by a Jew, tevila is required.",
  },
  {
    group: "Ownership & Transfers",
    title: "Items from a Jewish/non-Jewish partnership",
    text: "If a utensil is co-owned by a Jew and non-Jew, no tevila is required. If the Jew buys out the non-Jewish partner, tevila with a brocha is required.",
  },
  {
    group: "Ownership & Transfers",
    title: "Store-bought items — origin matters",
    text: "Items bought from a Jewish-owned store may still require tevila if the store purchased them from a non-Jewish wholesaler or manufacturer. If there is reason to suspect the utensils never belonged to a non-Jew, tovel without a brocha.",
  },
  {
    group: "Ownership & Transfers",
    title: "Items manufactured in Eretz Yisrael",
    text: "Utensils manufactured in Eretz Yisrael by Jews generally do not require tevila. If manufactured elsewhere and sold in Israel, tevila is required.",
  },
  {
    group: "Ownership & Transfers",
    title: "Used items from a non-Jew",
    text: "Used items bought from a non-Jew should be kashered first, then toveled. Order matters: kasher first, then tovel.",
  },
  {
    group: "Ownership & Transfers",
    title: "A convert's utensils",
    text: "Most poskim require tevilat keilim without a brocha after conversion, since the utensils transferred from non-Jewish to Jewish ownership. A minority opinion exempts them since the owner is the same person.",
  },

  // ——— Miscellaneous ———
  {
    group: "Miscellaneous",
    title: "Using before tevila — forbidden",
    text: "One may not use a utensil that requires tevila even once before immersion. This applies even in a hotel or restaurant where the user does not own the utensil. There is no leniency for 'one-time use before tevila.'",
  },
  {
    group: "Miscellaneous",
    title: "Food from an untoveled utensil",
    text: "Food prepared in an untoveled utensil is kosher after the fact. Transfer the food to properly toveled (or disposable) dishes for serving and eating.",
  },
  {
    group: "Miscellaneous",
    title: "Eating at someone's home",
    text: "If invited to eat at a friend's house, one should not investigate whether the host complies with tevilas keilim — we assume G-d fearing Jews follow halacha. If you know the utensils were not toveled, consult a Rav.",
  },
  {
    group: "Miscellaneous",
    title: "Shabbos and Yom Tov",
    text: "Tevila should not be performed on Shabbos or Yom Tov. If needed urgently, give the utensil to a non-Jew and borrow it back. Ashkenazim: if the vessel can draw water, one may use it to draw water from the mikveh (serves as tevila). Sephardim may be more lenient.",
  },
  {
    group: "Miscellaneous",
    title: "Unsure if already toveled",
    text: "If you are unsure whether a utensil was already toveled, tovel it again without a brocha. If unsure whether the utensil was purchased from a Jewish company, also tovel without a brocha.",
  },
  {
    group: "Miscellaneous",
    title: "Seder plate",
    text: "If food directly touches a metal or glass seder plate, tevila is required. If food sits in separate cups or holders that don't touch the plate, no tevila is needed.",
  },
  {
    group: "Miscellaneous",
    title: "Porcelain — Ashkenazi vs. Sephardi",
    text: "Ashkenazi poskim generally require tevila without a brocha for porcelain and china. Sephardi poskim, following the Shulchan Aruch, may hold that porcelain does not require tevila at all.",
  },
];

/* ------------------------------------------------------------------ */
/*  Derive unique groups in order of first appearance                 */
/* ------------------------------------------------------------------ */
const GROUPS = Array.from(new Set(RULES.map((r) => r.group)));

export default function BasicRules() {
  const [q, setQ] = useState("");

  const isSearching = q.trim().length > 0;

  const filtered = useMemo(() => {
    if (!q) return RULES;
    const L = q.toLowerCase();
    return RULES.filter(
      (r) =>
        r.title.toLowerCase().includes(L) ||
        r.text.toLowerCase().includes(L) ||
        r.group.toLowerCase().includes(L)
    );
  }, [q]);

  /* Group the filtered rules for article view */
  const grouped = useMemo(() => {
    const map = new Map<string, Rule[]>();
    for (const r of filtered) {
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push(r);
    }
    // Maintain original group order
    return GROUPS.filter((g) => map.has(g)).map((g) => ({
      group: g,
      rules: map.get(g)!,
    }));
  }, [filtered]);

  return (
    <section className="space-y-6">
      <SearchBar placeholder="Search rules (e.g., 'electric', 'plastic', 'brocha')…" onChange={setQ} />

      {/* ——— Article mode (default, no search) ——— */}
      {!isSearching && (
        <div className="space-y-8">
          {grouped.map(({ group, rules }) => (
            <div key={group}>
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-1 mb-3">
                {group}
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                {rules.map((r, i) => (
                  <div key={i}>
                    <span className="font-semibold text-slate-800">{r.title}: </span>
                    {r.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ——— Card mode (search active) ——— */}
      {isSearching && (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <div key={i} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-xs text-gray-400 mb-1">{r.group}</div>
              <h3 className="font-semibold text-slate-800">{r.title}</h3>
              <p className="mt-1 text-gray-700 text-sm">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-gray-500">No matching rules. Try a different term.</p>
      )}

      <p className="text-sm text-gray-500">
        See <Link className="underline decoration-sky-400" to="/materials">Materials</Link> for
        a material-by-material reference, or browse{" "}
        <Link className="underline decoration-sky-400" to="/">utensils</Link> for
        item-specific rulings.
      </p>
    </section>
  );
}