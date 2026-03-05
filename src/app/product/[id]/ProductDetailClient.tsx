"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatPrice, generateWhatsAppLink } from "@/lib/utils";
import {
  HiArrowLeft,
  HiShoppingCart,
  HiChat,
  HiHeart,
  HiTrash,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import ReviewSection from "@/components/ReviewSection";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    phone: string | null;
    nim: string;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
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

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete =
    session?.user &&
    ((session.user as any).id === product.seller.id ||
      (session.user as any).role === "ADMIN");

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Produk berhasil dihapus");
        router.push("/explore");
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus produk");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
      setIsDeleting(false);
    }
  };

  const handleWhatsApp = () => {
    if (product.seller.phone) {
      const link = generateWhatsAppLink(product.seller.phone, product.name);
      window.open(link, "_blank");
    }
  };

  const handleAddToCart = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setAddingToCart(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (res.ok) {
        setCartAdded(true);
        setTimeout(() => setCartAdded(false), 2000);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menambahkan ke keranjang");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      setWishlisted(data.wishlisted);
    } catch {
      console.error("Wishlist error");
    }
  };

  const displayImage =
    product.imageUrl ||
    DUMMY_IMAGES[product.category.name] ||
    DUMMY_IMAGES.default;

  return (
    <div
      className="fade-in"
      style={{ paddingBottom: "100px", background: "#f5f5f5" }}
    >
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-20 left-4 z-30 p-2.5 rounded-full shadow-lg"
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          color: "#1e293b",
        }}
      >
        <HiArrowLeft size={20} />
      </button>

      {/* Product Image */}
      <div className="relative w-full aspect-[4/5] bg-bg-card">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{
            background: "linear-gradient(transparent, var(--bg-dark))",
          }}
        />
      </div>

      {/* Product Info */}
      <div className="px-4 -mt-4 relative z-10">
        {/* Category badge */}
        <div className="mb-3">
          <span
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(42, 184, 198, 0.15)",
              color: "var(--primary-light)",
              border: "1px solid rgba(42, 184, 198, 0.2)",
            }}
          >
            {product.category.icon || "📦"} {product.category.name}
          </span>
        </div>

        {/* Name & Price & Delete Action */}
        <div className="flex justify-between items-start gap-3 mb-2">
          <h1
            className="text-xl font-bold flex-1"
            style={{ color: "var(--text-primary)" }}
          >
            {product.name}
          </h1>
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors flex-shrink-0"
              title="Hapus Produk"
            >
              <HiTrash size={20} />
            </button>
          )}
        </div>

        <p
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--secondary)" }}
        >
          {formatPrice(product.price)}
        </p>

        {/* Stock */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`pulse-dot`}
            style={{
              background:
                product.stock > 0 ? "var(--success)" : "var(--danger)",
            }}
          />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {product.stock > 0
              ? `Stok tersedia: ${product.stock}`
              : "Stok habis"}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px my-4" style={{ background: "var(--border)" }} />

        {/* Description */}
        <div className="mb-6">
          <h2
            className="font-semibold text-base mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Deskripsi Produk
          </h2>
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--text-secondary)" }}
          >
            {product.description}
          </p>
        </div>

        {/* Seller Info */}
        <div className="glass-card p-4 mb-6">
          <h3
            className="font-semibold text-sm mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Informasi Penjual
          </h3>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--secondary))",
              }}
            >
              <span className="text-white font-bold text-lg">
                {product.seller.name.charAt(0)}
              </span>
            </div>
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {product.seller.name}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                NIM: {product.seller.nim}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <ReviewSection productId={product.id} />
      </div>

      {/* Fixed Bottom CTA */}
      <div
        className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-3 z-40"
        style={{
          background: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div className="flex gap-2">
          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="p-3 rounded-xl border transition-colors"
            style={{
              borderColor: wishlisted ? "#ef4444" : "#e2e8f0",
              background: wishlisted ? "#fef2f2" : "#ffffff",
            }}
          >
            <HiHeart
              size={22}
              className={wishlisted ? "text-red-500" : "text-slate-400"}
            />
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock <= 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: cartAdded ? "#22c55e" : "var(--primary)",
              color: "white",
              opacity: product.stock <= 0 ? 0.5 : 1,
            }}
          >
            <HiShoppingCart size={18} />
            {cartAdded
              ? "Ditambahkan ✓"
              : addingToCart
                ? "Menambahkan..."
                : "Keranjang"}
          </button>

          {/* WhatsApp / Buy Button */}
          {product.seller.phone ? (
            <button
              onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white"
              style={{ background: "#25d366" }}
            >
              <FaWhatsapp size={18} />
              Beli Langsung
            </button>
          ) : (
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-slate-200 text-slate-500"
              disabled
            >
              <HiChat size={18} />
              Kontak N/A
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
