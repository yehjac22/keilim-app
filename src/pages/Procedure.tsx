import { useMemo, useState } from "react";
import SearchBar from "../components/SearchBar";
import { Link } from "react-router-dom";

const SECTIONS = [
  {
    h: "Preparation",
    p: [
      "Utensil must be completely clean: remove dirt, rust, stickers, labels, and glue.",
      "If immersed with a label by mistake, ask a Rav.",
    ],
  },
  {
    h: "Where to immerse",
    p: [
      "A mikvah that is kosher for tevilas noshim (women) is used for keilim; the ocean is acceptable.",
      "Rivers that are swollen from rain/snow should only be used once they return to normal levels.",
      "In great need, some permit immersing glass/china in a large, contiguous mass of snow (specific measurements; ask a Rav).",
    ],
  },
  {
    h: "Who may immerse",
    p: [
      "Anyone may tovel keilim (even a child or non-Jew) but a Jewish adult should witness it.",
      "The brocha is recited only when a Jewish adult performs the immersion.",
    ],
  },
  {
    h: "How to immerse",
    p: [
      "Wet your hand in the mikvah, hold the utensil in the wet hand.",
      "Recite\n “בָּרוּךְ אַתָּה ה' אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ עַל טְבִילַת כֶּלִי/כֵּלִים” “BA-RUCH A-TAH ADO-NOI ELO-HAI-NU ME-LECH HA'O-LAM A-SHER KID-SHA-NU B'-MITZ-VO-SAV V'TZI-VA-NU AL TE-VI-LAS KE-LI (KAI-LIM for plural).” as appropriate, and submerge.",
      "Mikvah water must touch the entire utensil, inside and out, at the same time.",
      "No part may be above water and keilim shouldn’t touch each other while under water.",
      "Removable lids can be immersed separately; narrow-necked bottles should be immersed neck-up so water fills the interior.",
    ],
  },
  {
    h: "Assemblies & appliances",
    p: [
      "Appliances with food-contact parts: immerse the parts that contact food (e.g., metal blades, bowls). The electric base is not immersed.",
      "If immersion will ruin an item (e.g., internal electronics), do not tovel it; ask a Rav for alternatives (e.g., gift/borrow arrangements).",
    ],
  },
  {
    h: "Timing & other cases",
    p: [
      "Do not use an item that requires tevila even once before immersion.",
      "Tevila is not performed on Shabbos or Yom Tov. In a pressing case, ask a Rav about gifting/borrowing workarounds.",
      "Order when buying used from a non-Jew: kasher first, then tovel.",
      "If ownership transfers between a non-Jew and a Jew (purchase or gift), tevila is required.",
    ],
  },
];

export default function Procedure() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q) return SECTIONS;
    const L = q.toLowerCase();
    return SECTIONS.map(s => ({
      ...s,
      p: s.p.filter(par => par.toLowerCase().includes(L)),
    })).filter(s => s.p.length > 0 || s.h.toLowerCase().includes(L));
  }, [q]);

  return (
    <section className="space-y-6">
      <SearchBar placeholder="Search procedure…" onChange={setQ} />
      <div className="space-y-6">
        {filtered.map((s) => (
          <div key={s.h} className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-xl font-bold">{s.h}</h2>
            <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1">
              {s.p.map((par, i) => <li key={i}>{par}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600">
        For materials, see <Link className="underline decoration-sky-400" to="/materials">Materials</Link>.
      </p>
    </section>
  );
}
