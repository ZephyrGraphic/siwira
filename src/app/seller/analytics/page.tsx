"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  HiArrowLeft,
  HiCube,
  HiCurrencyDollar,
  HiShoppingCart,
  HiStar,
  HiChat,
  HiTrendingUp,
} from "react-icons/hi";
import { formatPrice } from "@/lib/utils";

interface Analytics {
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  totalOrderItems: number;
  avgRating: number;
  totalReviews: number;
  topProducts: { name: string; sold: number; revenue: number }[];
}

export default function SellerAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/seller/analytics")
        .then((res) => res.json())
        .then((d) => setData(d))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (loading || !data) {
    return (
      <div className="px-4 py-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="skeleton h-6 w-1/3 bg-slate-200 mb-2" />
            <div className="skeleton h-8 w-1/2 bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: <HiCube size={22} />,
      label: "Total Produk",
      value: `${data.totalProducts}`,
      sub: `${data.activeProducts} aktif`,
      color: "#2AB8C6",
    },
    {
      icon: <HiCurrencyDollar size={22} />,
      label: "Total Pendapatan",
      value: formatPrice(data.totalRevenue),
      sub: `${data.totalOrderItems} item terjual`,
      color: "#F97316",
    },
    {
      icon: <HiStar size={22} />,
      label: "Rating Rata-rata",
      value: data.avgRating > 0 ? `${data.avgRating} / 5` : "—",
      sub: `${data.totalReviews} ulasan`,
      color: "#FBBF24",
    },
    {
      icon: <HiShoppingCart size={22} />,
      label: "Item Terjual",
      value: `${data.totalOrderItems}`,
      sub: "total item",
      color: "#22C55E",
    },
  ];

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
        <h1 className="text-lg font-bold text-slate-800">
          <HiTrendingUp className="inline mr-1.5 text-teal-500" size={20} />
          Analitik Penjualan
        </h1>
      </div>

      {/* Stat Cards Grid */}
      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5"
              style={{ background: `${card.color}15`, color: card.color }}
            >
              {card.icon}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {card.label}
            </p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">
              {card.value}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Top Products */}
      <div className="px-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-1.5">
              <HiTrendingUp size={16} className="text-teal-500" />
              Produk Terlaris
            </h3>
          </div>
          {data.topProducts.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-slate-500">Belum ada penjualan</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.topProducts.map((product, i) => (
                <div
                  key={i}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{
                        background:
                          i === 0 ? "#F97316" : i === 1 ? "#64748B" : "#CBD5E1",
                      }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {product.sold} terjual
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold whitespace-nowrap"
                    style={{ color: "var(--secondary)" }}
                  >
                    {formatPrice(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
