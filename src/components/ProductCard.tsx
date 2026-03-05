"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  sellerName: string;
  categoryName: string;
  stock: number;
}

const DUMMY_IMAGES: Record<string, string> = {
  Makanan:
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&h=400&fit=crop",
  Minuman:
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=400&h=400&fit=crop",
  Jasa: "https://images.unsplash.com/photo-1581291518857-4e27b48fc4d1?q=80&w=400&h=400&fit=crop",
  Merchandise:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&h=400&fit=crop",
  "Produk Digital":
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&h=400&fit=crop",
  default:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&h=400&fit=crop",
};

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  sellerName,
  categoryName,
  stock,
}: ProductCardProps) {
  const displayImage =
    imageUrl || DUMMY_IMAGES[categoryName] || DUMMY_IMAGES.default;

  return (
    <Link href={`/product/${id}`} className="block fade-in">
      <div
        className="group bg-white rounded-xl overflow-hidden shadow-sm"
        style={{ border: "1px solid rgba(0,0,0,0.04)" }}
      >
        <div className="relative overflow-hidden aspect-square">
          <img
            src={displayImage}
            alt={name}
            className="product-image w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {stock <= 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]"
              style={{ background: "rgba(15, 23, 42, 0.7)" }}
            >
              <span className="text-white font-bold text-sm bg-danger px-3 py-1 rounded-full">
                Stok Habis
              </span>
            </div>
          )}
          <div
            className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-sm"
            style={{
              background: "rgba(42, 184, 198, 0.9)", // SIWIRA Teal
              backdropFilter: "blur(8px)",
              color: "white",
            }}
          >
            {categoryName}
          </div>
        </div>
        <div className="p-2.5">
          <h3 className="font-medium text-[12px] mb-1 line-clamp-2 leading-tight text-slate-800">
            {name}
          </h3>
          <p
            className="font-bold text-[13px] mb-2"
            style={{ color: "var(--secondary)" }}
          >
            {formatPrice(price)}
          </p>
          <div className="flex items-center gap-1.5 mt-1 border-t border-slate-100 pt-2">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--secondary))",
                color: "white",
              }}
            >
              {sellerName.charAt(0)}
            </div>
            <span className="text-[10px] truncate text-slate-500 font-normal">
              {sellerName}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
