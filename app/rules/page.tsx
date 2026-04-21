"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import SearchBar from "@/components/SearchBar";

const RULES = [
  "Utensils requiring tevila with a brocha: direct food-contact items made of metal or glass.",
  "Utensils requiring tevila without a brocha: glazed china, bone china, stoneware, CorningWare, porcelain enamel, and coated metal combinations.",
  "No tevila required: plastic, wood, stone, paper, bone, Styrofoam, and non-glazed earthenware.",
  "For mixed materials, follow the food-contact material and apply the stricter status where relevant.",
  "Painted metal or glass still requires tevila with a brocha.",
  "Non-food items made of metal/glass do not require tevila even if occasionally used with food.",
  "Borrowed or rented utensils from a non-Jew do not require tevila; purchased and owned ones do.",
  "Used items bought from a non-Jew should be kashered before tevila.",
  "If tevila will damage an item, ask a Rav about alternatives.",
  "Food prepared in an untoveled utensil is kosher after the fact.",
];

export default function RulesPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return RULES;
    const lower = query.toLowerCase();
    return RULES.filter((rule) => rule.toLowerCase().includes(lower));
  }, [query]);

  return (
    <section className="space-y-6">
      <SearchBar placeholder="Search basic rules..." onChange={setQuery} />
      <ol className="space-y-3">
        {filtered.map((rule, index) => (
          <li key={index} className="rounded-2xl border bg-white p-4 shadow-sm">
            <span className="mr-2 font-semibold">{index + 1}.</span>
            <span className="text-gray-800">{rule}</span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-gray-600">
        See <Link className="underline decoration-sky-400" href="/materials">Materials</Link> for specifics and examples.
      </p>
    </section>
  );
}
