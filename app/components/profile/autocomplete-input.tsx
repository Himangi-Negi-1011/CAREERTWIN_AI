"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";

export interface AutocompleteItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: AutocompleteItem[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  onCustomAdd?: (customValue: string) => void;
}

export function AutocompleteInput({
  label,
  value,
  onChange,
  items,
  placeholder = "Search or type custom…",
  required = false,
  className = "",
  onCustomAdd,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const inputId = useId();

  if (value !== prevValue) {
    setPrevValue(value);
    setQuery(value);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? items.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  const isExactMatch = items.some(
    (item) => item.title.toLowerCase() === query.trim().toLowerCase()
  );

  function handleSelect(itemTitle: string) {
    setQuery(itemTitle);
    onChange(itemTitle);
    setOpen(false);
    setHighlightedIndex(-1);
  }

  function handleCustomConfirm() {
    if (!query.trim()) return;
    onChange(query.trim());
    if (onCustomAdd) onCustomAdd(query.trim());
    setOpen(false);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        handleSelect(filtered[highlightedIndex].title);
      } else if (query.trim()) {
        handleCustomConfirm();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label htmlFor={inputId} className="block text-xs font-bold text-ink mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate/50">
          <Search size={15} />
        </div>
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          role="combobox"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label={label}
          className="w-full rounded-xl border border-ink/10 bg-white py-3 pl-10 pr-9 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-violet-100 placeholder:text-slate/40"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Toggle options list"
          onClick={() => setOpen((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate/40 hover:text-slate"
        >
          <ChevronDown size={15} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-64 w-full overflow-y-auto rounded-2xl border border-ink/10 bg-white p-1.5 shadow-[0_16px_40px_rgba(32,36,64,.12)]"
        >
          {filtered.length > 0 ? (
            filtered.map((item, index) => {
              const isSelected = item.title === value;
              const isHighlighted = index === highlightedIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item.title)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl px-3 py-2.5 transition ${
                    isHighlighted ? "bg-violet-50 text-accent" : isSelected ? "bg-cream/70 font-semibold" : "text-ink hover:bg-app"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate truncate">
                        <MapPin size={11} className="shrink-0 text-slate/60" />
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {item.badge && (
                      <span className="rounded-md bg-app px-2 py-0.5 text-[10px] font-semibold text-slate">
                        {item.badge}
                      </span>
                    )}
                    {isSelected && <Check size={14} className="text-accent" />}
                  </div>
                </div>
              );
            })
          ) : null}

          {query.trim() && !isExactMatch && (
            <div
              role="option"
              aria-selected={false}
              onClick={handleCustomConfirm}
              className="mt-1 cursor-pointer rounded-xl border border-dashed border-violet-300 bg-violet-50/60 p-2.5 text-center text-xs font-bold text-accent hover:bg-violet-100/60 transition"
            >
              + Use custom: “<span className="underline">{query.trim()}</span>”
            </div>
          )}

          {filtered.length === 0 && !query.trim() && (
            <div className="p-4 text-center text-xs text-slate">
              Type to search recognized institutions or add a custom name.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

