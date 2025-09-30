import { useState, useEffect } from "react";

export default function SearchBar({
  placeholder = "Search…",
  onChange,
  autoFocus = false,
}: {
  placeholder?: string;
  onChange: (q: string) => void;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState("");
  useEffect(() => onChange(q), [q, onChange]);

  return (
    <div className="relative">
      <input
        autoFocus={autoFocus}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border px-4 py-3 pr-10 shadow-sm outline-none focus:ring-2 ring-sky-500 transition"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</div>
    </div>
  );
}
