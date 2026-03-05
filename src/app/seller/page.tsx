"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiShoppingBag, HiPlus, HiPencil, HiEye, HiCube } from "react-icons/hi";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  category: { name: string };
  createdAt: string;
}

export default function SellerDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    const user = session.user as any;
    if (user.role !== "SELLER" && user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    if (user.approvalStatus !== "APPROVED") {
      router.push("/");
      return;
    }
    fetchProducts();
  }, [session, sessionStatus]);

  const fetchProducts = async () => {
    try {
      const user = session?.user as any;
      const res = await fetch(`/api/products?sellerId=${user.id}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="px-4 py-4 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HiShoppingBag
              size={24}
              style={{ color: "var(--primary-light)" }}
            />
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Toko Saya
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Kelola produk dan toko Anda
          </p>
        </div>
        <Link
          href="/seller/products/new"
          className="btn-primary !py-2.5 !px-4 !text-sm"
        >
          <HiPlus size={18} />
          Tambah
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Total Produk",
            value: totalProducts,
            icon: <HiCube size={20} />,
            color: "var(--primary-light)",
          },
          {
            label: "Aktif",
            value: activeProducts,
            icon: <HiEye size={20} />,
            color: "var(--success)",
          },
          {
            label: "Total Stok",
            value: totalStock,
            icon: <HiShoppingBag size={20} />,
            color: "var(--secondary)",
          },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-3 text-center">
            <div className="mx-auto mb-1" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <p
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {stat.value}
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Products List */}
      <div className="flex items-center justify-between mb-3">
        <h2
          className="font-semibold text-base"
          style={{ color: "var(--text-primary)" }}
        >
          Produk Saya
        </h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-4 flex gap-3">
              <div className="skeleton w-16 h-16 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="glass-card p-3 flex gap-3 items-center slide-up block"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--bg-card-hover)" }}
                >
                  <span className="text-2xl">📦</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-sm truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {product.name}
                </h3>
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--secondary)" }}
                >
                  {formatPrice(product.price)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Stok: {product.stock}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    •
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {product.category.name}
                  </span>
                </div>
              </div>
              <div
                className={`w-2 h-2 rounded-full`}
                style={{
                  background: product.isActive
                    ? "var(--success)"
                    : "var(--danger)",
                }}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 fade-in">
          <div className="text-5xl mb-4">🏪</div>
          <h3
            className="font-semibold text-lg mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Belum ada produk
          </h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Mulai jual produk UMKM Anda sekarang!
          </p>
          <Link href="/seller/products/new" className="btn-primary">
            <HiPlus size={18} />
            Tambah Produk Pertama
          </Link>
        </div>
      )}
    </div>
  );
}
