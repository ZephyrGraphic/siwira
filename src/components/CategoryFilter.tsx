"use client";

interface CategoryFilterProps {
  categories: { id: string; name: string; icon: string | null }[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const defaultIcons: Record<string, string> = {
  Makanan: "🍜",
  Minuman: "🥤",
  Merchandise: "👕",
  Jasa: "💼",
  "Produk Digital": "💻",
  default: "📦",
};

export default function CategoryFilter({
  categories,
  selectedId,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-3">
        {/* 'Semua' Button */}
        <button
          onClick={() => onSelect(null)}
          className="flex flex-col items-center w-16"
        >
          <div
            className="w-12 h-12 rounded-[18px] flex items-center justify-center mb-1.5 transition-all shadow-sm"
            style={{
              background:
                selectedId === null
                  ? "linear-gradient(135deg, var(--primary), var(--secondary))"
                  : "var(--bg-card)",
              color: selectedId === null ? "white" : "var(--primary)",
              border: selectedId === null ? "none" : "1px solid var(--border)",
              transform: selectedId === null ? "scale(1.05)" : "scale(1)",
            }}
          >
            <span className="text-xl">🔥</span>
          </div>
          <span
            className="text-[10px] font-semibold text-center leading-tight tracking-tight text-slate-700"
            style={{
              color: selectedId === null ? "var(--primary-dark)" : "inherit",
              opacity: selectedId === null ? 1 : 0.8,
            }}
          >
            Semua
          </span>
        </button>

        {/* Dynamic Category Buttons */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="flex flex-col items-center w-16"
          >
            <div
              className="w-12 h-12 rounded-[18px] flex items-center justify-center mb-1.5 transition-all shadow-sm"
              style={{
                background:
                  selectedId === cat.id
                    ? "linear-gradient(135deg, var(--primary), var(--secondary))"
                    : "var(--bg-card)",
                color: selectedId === cat.id ? "white" : "var(--primary-light)",
                border:
                  selectedId === cat.id ? "none" : "1px solid var(--border)",
                transform: selectedId === cat.id ? "scale(1.05)" : "scale(1)",
              }}
            >
              <span className="text-xl">
                {cat.icon || defaultIcons[cat.name] || defaultIcons.default}
              </span>
            </div>
            <span
              className="text-[10px] font-semibold text-center leading-tight tracking-tight text-slate-700 line-clamp-2"
              style={{
                color:
                  selectedId === cat.id ? "var(--primary-dark)" : "inherit",
                opacity: selectedId === cat.id ? 1 : 0.8,
              }}
            >
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
