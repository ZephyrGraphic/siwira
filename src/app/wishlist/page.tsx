"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiHeart } from "react-icons/hi";
import ProductCard from "@/components/ProductCard";

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    stock: number;
    seller: { id: string; name: string };
    category: { name: string };
  };
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/wishlist")
        .then((res) => res.json())
        .then((data) => setItems(Array.isArray(data) ? data : []))
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }
  }, [session]);

  const removeFromWishlist = async (productId: string) => {
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  return (
    <div
      className="fade-in"
      style={{
        paddingBottom: "80px",
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}
      >
        <button onClick={() => router.back()} className="p-1">
          <HiArrowLeft size={22} className="text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Wishlist</h1>
        <span className="ml-auto text-sm text-slate-500">
          <HiHeart className="inline text-red-400 mr-1" size={16} />
          {items.length}
        </span>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {[...Array(4)].map((_, i) => (
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
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow-sm border border-dashed border-slate-200">
            <div className="text-5xl mb-4 grayscale opacity-50">❤️</div>
            <h3 className="font-semibold text-slate-700 text-base mb-1">
              Wishlist Kosong
            </h3>
            <p className="text-sm text-slate-500 max-w-[70%]">
              Tandai produk favorit kamu dengan ikon hati!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {items.map((item) => (
              <div key={item.id} className="relative">
                <ProductCard
                  id={item.product.id}
                  name={item.product.name}
                  price={item.product.price}
                  imageUrl={item.product.imageUrl}
                  sellerName={item.product.seller.name}
                  categoryName={item.product.category.name}
                  stock={item.product.stock}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromWishlist(item.product.id);
                  }}
                  className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white shadow-md"
                >
                  <HiHeart size={16} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
