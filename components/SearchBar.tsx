"use client";

import { useEffect, useMemo, useState } from "react";

export type SearchSuggestion = {
  label: string;
  value?: string;
};

type SearchBarProps = {
  placeholder?: string;
  onChange: (query: string) => void;
  autoFocus?: boolean;
  suggestions?: SearchSuggestion[];
  maxSuggestions?: number;
  onSelectSuggestion?: (suggestion: SearchSuggestion) => void;
  onSubmitQuery?: (query: string) => void;
};

export default function SearchBar({
  placeholder = "Search...",
  onChange,
  autoFocus = false,
  suggestions = [],
  maxSuggestions = 8,
  onSelectSuggestion,
  onSubmitQuery,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredSuggestions = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    const exact = normalizedQuery;
    return suggestions
      .filter((suggestion) => {
        const normalizedSuggestion = suggestion.label.toLowerCase();
        return normalizedSuggestion.includes(normalizedQuery) && normalizedSuggestion !== exact;
      })
      .slice(0, maxSuggestions);
  }, [suggestions, normalizedQuery, maxSuggestions]);

  const shouldShowDropdown = showSuggestions && filteredSuggestions.length > 0;

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
      setShowSuggestions(false);
      return;
    }

    setQuery(suggestion.label);
    setShowSuggestions(false);
  };

  useEffect(() => {
    onChange(query);
  }, [query, onChange]);

  return (
    <div className="relative">
      <input
        autoFocus={autoFocus}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") {
            return;
          }

          if (filteredSuggestions.length > 0) {
            event.preventDefault();
            selectSuggestion(filteredSuggestions[0]);
            return;
          }

          if (onSubmitQuery) {
            onSubmitQuery(query);
          }
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          window.setTimeout(() => {
            setShowSuggestions(false);
          }, 100);
        }}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-20 text-base shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 ring-sky-500"
        aria-label="Search utensils"
        role="combobox"
        aria-expanded={shouldShowDropdown}
        aria-controls="search-suggestion-list"
        aria-autocomplete="list"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setShowSuggestions(false);
          }}
          className="absolute right-10 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          aria-label="Clear search"
        >
          Clear
        </button>
      ) : null}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</div>

      {shouldShowDropdown ? (
        <ul
          id="search-suggestion-list"
          role="listbox"
          className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          {filteredSuggestions.map((suggestion) => (
            <li key={`${suggestion.label}-${suggestion.value || ""}`} role="option" aria-selected="false">
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectSuggestion(suggestion);
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-sky-50"
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
