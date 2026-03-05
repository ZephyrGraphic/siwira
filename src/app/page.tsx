"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import HeroCarousel from "@/components/HeroCarousel";
import { formatPrice } from "@/lib/utils";

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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("categoryId", selectedCategory);
      params.set("limit", "20");
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

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

  return (
    <div
      className="fade-in"
      style={{ background: "#f5f5f5", paddingBottom: "80px" }}
    >
      {/* Hero Carousel */}
      <div className="px-3 pt-3">
        <HeroCarousel />
      </div>

      {/* Promo Strip */}
      <div
        className="mx-3 mb-4 flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-x-auto no-scrollbar"
        style={{ background: "linear-gradient(135deg, #FFF7ED, #FEF3C7)" }}
      >
        {[
          { icon: "🚚", text: "Gratis Ongkir" },
          { icon: "✅", text: "Verified HMSI" },
          { icon: "💬", text: "Chat Langsung" },
          { icon: "🔒", text: "Aman & Amanah" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-base">{item.icon}</span>
            <span className="text-[10px] font-semibold text-amber-800 whitespace-nowrap">
              {item.text}
            </span>
            {i < 3 && <span className="text-amber-300 ml-1">|</span>}
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="px-3 mb-4">
        <CategoryFilter
          categories={categories}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Flash Sale Banner */}
      <div className="px-3 mb-4">
        <div
          className="rounded-xl overflow-hidden p-4 relative"
          style={{
            background: "linear-gradient(135deg, #FF6B35, #F7901E)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">⚡</span>
                <h3 className="font-extrabold text-white text-base tracking-wide">
                  Flash Sale
                </h3>
              </div>
              <p className="text-[11px] text-orange-100 font-medium">
                Produk pilihan dengan harga spesial!
              </p>
            </div>
            <Link
              href="/explore"
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-orange-600 bg-white shadow-sm"
            >
              Lihat Semua &rarr;
            </Link>
          </div>

          {/* Flash sale products horizontal scroll */}
          <div className="flex gap-2.5 mt-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {(loading ? [...Array(3)] : products.slice(0, 4)).map(
              (product, i) =>
                product ? (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="flex-shrink-0 w-28 bg-white rounded-xl overflow-hidden shadow-sm"
                  >
                    <img
                      src={
                        product.imageUrl ||
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&h=200&fit=crop"
                      }
                      alt={product.name}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                    />
                    <div className="p-2">
                      <p className="text-[10px] text-slate-700 font-medium line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-[11px] font-bold text-orange-600">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div
                    key={i}
                    className="flex-shrink-0 w-28 bg-white/50 rounded-xl overflow-hidden"
                  >
                    <div className="w-full aspect-square bg-white/30 animate-pulse" />
                    <div className="p-2 space-y-1">
                      <div className="h-2.5 w-2/3 bg-white/30 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-white/30 rounded animate-pulse" />
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>
      </div>

      {/* Ad Banner: SIWIRA Info */}
      <div className="px-3 mb-4">
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg, #E0F7FA, #B2EBF2)",
            border: "1px solid rgba(42, 184, 198, 0.2)",
          }}
        >
          <div className="flex-shrink-0">
            <img
              src="/logo_siwira.png"
              alt="SIWIRA"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-teal-800">Gabung SIWIRA!</h4>
            <p className="text-[10px] text-teal-700 leading-relaxed mt-0.5">
              Daftar sekarang dan mulai jualan produk kreatifmu ke sesama
              mahasiswa SI.
            </p>
          </div>
          <Link
            href="/register"
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white"
            style={{ background: "var(--primary)" }}
          >
            Daftar
          </Link>
        </div>
      </div>

      {/* Product Grid Section */}
      <div className="px-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <span>🛍️</span>
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name ||
                "Produk"
              : "Rekomendasi Untukmu"}
          </h3>
          <Link
            href="/explore"
            className="text-[11px] font-semibold"
            style={{ color: "var(--primary)" }}
          >
            Lihat Semua &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100"
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
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl shadow-sm border border-slate-100 border-dashed">
            <div className="text-4xl mb-3 grayscale opacity-60">🛍️</div>
            <h3 className="font-semibold text-[15px] mb-1.5 text-slate-700">
              Belum ada produk
            </h3>
            <p className="text-[12px] text-slate-500 max-w-[80%] leading-relaxed">
              Produk mahasiswa SI belum tersedia di kategori ini.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Ad Banner: HMSI */}
      <div className="px-3 mt-5 mb-3">
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: "linear-gradient(135deg, #1E293B, #334155)",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <img
              src="/logo_hmsi.jpg"
              alt="HMSI"
              className="w-9 h-9 rounded-full object-cover shadow border-2 border-white/20"
            />
            <img
              src="/logo_siwira.png"
              alt="SIWIRA"
              className="w-9 h-9 object-contain"
            />
          </div>
          <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
            SIWIRA &mdash; Pasar Digital oleh HMSI
          </p>
          <p className="text-[9px] text-slate-500 mt-1">
            Universitas Nusa Putra &bull; Sistem Informasi
          </p>
        </div>
      </div>
    </div>
  );
}
