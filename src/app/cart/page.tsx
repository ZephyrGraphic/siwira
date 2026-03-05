"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiMinus, HiPlus, HiTrash } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { formatPrice, generateWhatsAppCartLink } from "@/lib/utils";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    stock: number;
    seller: { id: string; name: string; phone: string | null };
    category: { name: string };
  };
}

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

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        console.error("Cart fetch failed with status:", res.status);
        setItems([]);
        setTotalPrice(0);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
      setTotalPrice(data.totalPrice || 0);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchCart();
  }, [session]);

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId }),
      });
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Group items by seller for WhatsApp checkout
  const sellerGroups = items.reduce(
    (groups, item) => {
      const sellerId = item.product.seller.id;
      if (!groups[sellerId]) {
        groups[sellerId] = {
          seller: item.product.seller,
          items: [],
          total: 0,
        };
      }
      groups[sellerId].items.push(item);
      groups[sellerId].total += item.product.price * item.quantity;
      return groups;
    },
    {} as Record<
      string,
      {
        seller: CartItem["product"]["seller"];
        items: CartItem[];
        total: number;
      }
    >,
  );

  const handleWhatsAppCheckout = (sellerId: string) => {
    const group = sellerGroups[sellerId];
    if (!group || !group.seller.phone) {
      alert("Penjual belum mencantumkan nomor WhatsApp.");
      return;
    }
    const buyerName = (session?.user as any)?.name || "";
    const link = generateWhatsAppCartLink(
      group.seller.phone,
      group.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
      group.total,
      buyerName,
      orderNote || undefined,
    );
    window.open(link, "_blank");
  };

  if (status === "loading" || loading) {
    return (
      <div className="px-4 py-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 shadow-sm flex gap-3"
            >
              <div className="skeleton w-20 h-20 rounded-lg bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 bg-slate-200" />
                <div className="skeleton h-4 w-1/2 bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fade-in"
      style={{
        paddingBottom: "140px",
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
        <h1 className="text-lg font-bold text-slate-800">Keranjang Belanja</h1>
        <span className="ml-auto text-sm text-slate-500">
          {items.length} item
        </span>
      </div>

      {/* Cart Items */}
      <div className="px-4 py-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow-sm border border-dashed border-slate-200">
            <div className="text-5xl mb-4 grayscale opacity-50">🛒</div>
            <h3 className="font-semibold text-slate-700 text-base mb-1">
              Keranjang Kosong
            </h3>
            <p className="text-sm text-slate-500 max-w-[70%]">
              Yuk, mulai belanja produk kreatif mahasiswa SI!
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-5 btn-primary text-sm !py-2 !px-5"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          items.map((item) => {
            const img =
              item.product.imageUrl ||
              DUMMY_IMAGES[item.product.category.name] ||
              DUMMY_IMAGES.default;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex gap-3"
              >
                <img
                  src={img}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-slate-800 line-clamp-2 leading-tight mb-0.5">
                    {item.product.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-1.5">
                    {item.product.seller.name}
                  </p>
                  <p
                    className="font-bold text-sm"
                    style={{ color: "var(--secondary)" }}
                  >
                    {formatPrice(item.product.price)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <HiTrash size={16} />
                  </button>
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-slate-600"
                    >
                      <HiMinus size={12} />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-slate-600"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <HiPlus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="bg-white w-full max-w-[430px] rounded-t-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-800">
                Pesan via WhatsApp
              </h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-slate-400 text-xl"
              >
                &times;
              </button>
            </div>

            {/* Items grouped by seller */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {Object.entries(sellerGroups).map(([sellerId, group]) => (
                <div
                  key={sellerId}
                  className="border border-slate-100 rounded-xl overflow-hidden"
                >
                  <div className="bg-slate-50 px-3 py-2 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">
                      🏪 {group.seller.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {group.items.length} produk
                    </span>
                  </div>
                  <div className="px-3 py-2 space-y-1.5">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm text-slate-600"
                      >
                        <span className="line-clamp-1 flex-1 pr-2">
                          {item.product.name} x{item.quantity}
                        </span>
                        <span className="font-medium whitespace-nowrap">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-slate-100 pt-1.5 flex justify-between items-center">
                      <span className="text-xs text-slate-500">Subtotal</span>
                      <span
                        className="font-bold text-sm"
                        style={{ color: "var(--secondary)" }}
                      >
                        {formatPrice(group.total)}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => handleWhatsAppCheckout(sellerId)}
                      disabled={!group.seller.phone}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity"
                      style={{
                        background: group.seller.phone ? "#25d366" : "#94a3b8",
                      }}
                    >
                      <FaWhatsapp size={18} />
                      {group.seller.phone
                        ? "Pesan via WhatsApp"
                        : "Nomor WA tidak tersedia"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <textarea
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Catatan untuk penjual (opsional)..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-teal-400 resize-none text-slate-700"
              rows={2}
            />

            <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-800">
              <span>Total Semua</span>
              <span style={{ color: "var(--secondary)" }}>
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      {items.length > 0 && (
        <div
          className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-4 z-40"
          style={{
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">
              Total ({items.reduce((s, i) => s + i.quantity, 0)} item)
            </span>
            <span
              className="text-lg font-bold"
              style={{ color: "var(--secondary)" }}
            >
              {formatPrice(totalPrice)}
            </span>
          </div>
          <button
            onClick={() => setShowCheckout(true)}
            className="btn-primary w-full !py-3 text-sm font-semibold"
          >
            Checkout via WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
