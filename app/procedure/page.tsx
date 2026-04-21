"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import SearchBar from "@/components/SearchBar";

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
      "Recite the appropriate bracha and submerge.",
      "Mikvah water must touch the entire utensil, inside and out, at the same time.",
      "No part may be above water and keilim should not touch each other while under water.",
      "Removable lids can be immersed separately; narrow-necked bottles should be immersed neck-up so water fills the interior.",
    ],
  },
  {
    h: "Electric appliances",
    p: [
      "Electric appliances with metal or glass parts that contact food require tevila (e.g., blender blades, urn interior, grill plates).",
      "The motor, base, and electrical housing do not require tevila.",
      "If immersion will ruin the appliance, consult a Rav for alternatives.",
      "After toveling an electric appliance, let it dry thoroughly for at least 48 hours before use.",
    ],
  },
  {
    h: "Timing and other cases",
    p: [
      "Do not use an item that requires tevila even once before immersion.",
      "Tevila is not performed on Shabbos or Yom Tov.",
      "Order when buying used from a non-Jew: kasher first, then tovel.",
    ],
  },
];

export default function ProcedurePage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return SECTIONS;
    const lower = query.toLowerCase();

    return SECTIONS.map((section) => ({
      ...section,
      p: section.p.filter((paragraph) => paragraph.toLowerCase().includes(lower)),
    })).filter((section) => section.p.length > 0 || section.h.toLowerCase().includes(lower));
  }, [query]);

  return (
    <section className="space-y-6">
      <SearchBar placeholder="Search procedure..." onChange={setQuery} />
      <div className="space-y-6">
        {filtered.map((section) => (
          <div key={section.h} className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-xl font-bold">{section.h}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
              {section.p.map((paragraph, index) => (
                <li key={index}>{paragraph}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600">
        For materials, see <Link className="underline decoration-sky-400" href="/materials">Materials</Link>.
      </p>
    </section>
  );
}
