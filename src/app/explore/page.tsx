"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { HiAdjustments, HiSortDescending } from "react-icons/hi";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  seller: { id: string; name: string; phone: string | null };
  category: { id: string; name: string; icon: string | null };
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "price_asc", label: "Harga Terendah" },
  { value: "price_desc", label: "Harga Tertinggi" },
  { value: "name_asc", label: "A - Z" },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory) params.set("categoryId", selectedCategory);
      params.set("limit", "50");

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      let prods: Product[] = data.products || [];

      // Client-side price filter
      if (minPrice) prods = prods.filter((p) => p.price >= Number(minPrice));
      if (maxPrice) prods = prods.filter((p) => p.price <= Number(maxPrice));

      // Client-side sort
      switch (sortBy) {
        case "price_asc":
          prods.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          prods.sort((a, b) => b.price - a.price);
          break;
        case "name_asc":
          prods.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "newest":
        default:
          break; // API already returns newest first
      }

      setProducts(prods);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, minPrice, maxPrice]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  const activeFilterCount =
    (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (sortBy !== "newest" ? 1 : 0);

  return (
    <div
      className="fade-in"
      style={{
        paddingBottom: "80px",
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Filter Bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-base font-bold text-slate-800">
            Jelajahi Produk
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
            style={{
              borderColor:
                showFilters || activeFilterCount > 0
                  ? "var(--primary)"
                  : "#e2e8f0",
              background: showFilters ? "rgba(42,184,198,0.05)" : "#fff",
              color:
                showFilters || activeFilterCount > 0
                  ? "var(--primary)"
                  : "#64748b",
            }}
          >
            <HiAdjustments size={16} />
            Filter
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-slate-200 p-3 mb-2 space-y-3">
            {/* Sort */}
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                <HiSortDescending className="inline mr-1" size={14} />
                Urutkan
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background:
                        sortBy === opt.value ? "var(--primary)" : "#f1f5f9",
                      color: sortBy === opt.value ? "white" : "#64748b",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                💰 Rentang Harga
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-400 text-slate-700"
                />
                <span className="text-slate-400 text-xs">—</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-400 text-slate-700"
                />
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setSortBy("newest");
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="text-xs text-red-500 font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="px-4 pt-4 pb-2">
        <CategoryFilter
          categories={categories}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Results */}
      <div className="px-4 py-2">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-slate-500">
            {products.length} produk ditemukan
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <div className="skeleton w-full aspect-square bg-slate-100" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-3 w-3/4 bg-slate-200" />
                  <div className="skeleton h-4 w-1/2 bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                sellerName={product.seller.name}
                categoryName={product.category.name}
                stock={product.stock}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl shadow-sm">
            <div className="text-5xl mb-4 grayscale opacity-50">🔍</div>
            <h3 className="font-semibold text-slate-700 text-base mb-1">
              Tidak ditemukan
            </h3>
            <p className="text-sm text-slate-500">
              Coba kata kunci lain atau ubah filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">Memuat katalog...</div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
