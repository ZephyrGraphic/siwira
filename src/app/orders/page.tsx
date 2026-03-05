"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    seller: { name: string; phone: string | null };
    category: { name: string };
  };
}

interface Order {
  id: string;
  totalPrice: number;
  status: string;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-600", label: "Menunggu" },
  CONFIRMED: { bg: "bg-blue-50", text: "text-blue-600", label: "Dikonfirmasi" },
  COMPLETED: { bg: "bg-green-50", text: "text-green-600", label: "Selesai" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-600", label: "Dibatalkan" },
};

const DUMMY_IMAGES: Record<string, string> = {
  Makanan:
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&h=200&fit=crop",
  Minuman:
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=200&h=200&fit=crop",
  Jasa: "https://images.unsplash.com/photo-1581291518857-4e27b48fc4d1?q=80&w=200&h=200&fit=crop",
  Merchandise:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&h=200&fit=crop",
  default:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&h=200&fit=crop",
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    }
  }, [session]);

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
        <h1 className="text-lg font-bold text-slate-800">Pesanan Saya</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 shadow-sm space-y-3"
            >
              <div className="skeleton h-4 w-1/3 bg-slate-200" />
              <div className="skeleton h-16 w-full bg-slate-100 rounded-lg" />
              <div className="skeleton h-4 w-1/2 bg-slate-200" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow-sm border border-dashed border-slate-200">
            <div className="text-5xl mb-4 grayscale opacity-50">📦</div>
            <h3 className="font-semibold text-slate-700 text-base mb-1">
              Belum ada pesanan
            </h3>
            <p className="text-sm text-slate-500">
              Pesanan kamu akan muncul di sini.
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const statusStyle =
              STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                {/* Order Items */}
                <div className="px-4 py-3 space-y-3">
                  {order.items.map((item) => {
                    const img =
                      item.product.imageUrl ||
                      DUMMY_IMAGES[item.product.category.name] ||
                      DUMMY_IMAGES.default;
                    return (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={img}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-800 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {item.product.seller.name}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-slate-500">
                              x{item.quantity}
                            </span>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: "var(--secondary)" }}
                            >
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Footer */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} produk
                  </span>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500">Total: </span>
                    <span
                      className="font-bold text-sm"
                      style={{ color: "var(--secondary)" }}
                    >
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
