"use client";

import { useState } from "react";
import { HiSearch, HiX } from "react-icons/hi";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Cari produk UMKM...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <HiSearch
          className="absolute left-4 top-1/2 -translate-y-1/2"
          size={18}
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder={placeholder}
          className="input-field pl-11 pr-10"
          style={{
            borderRadius: "14px",
            background: "var(--bg-card)",
            fontSize: "0.9rem",
          }}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <HiX size={16} />
          </button>
        )}
      </div>
    </form>
  );
}
