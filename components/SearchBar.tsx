"use client";

import { useEffect, useState } from "react";

type SearchBarProps = {
  placeholder?: string;
  onChange: (query: string) => void;
  autoFocus?: boolean;
};

export default function SearchBar({
  placeholder = "Search...",
  onChange,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    onChange(query);
  }, [query, onChange]);

  return (
    <div className="relative">
      <input
        autoFocus={autoFocus}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-20 text-base shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 ring-sky-500"
        aria-label="Search utensils"
      />
      {query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-10 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          aria-label="Clear search"
        >
          Clear
        </button>
      ) : null}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</div>
    </div>
  );
}
