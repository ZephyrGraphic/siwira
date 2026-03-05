"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { HiBell, HiSearch, HiShoppingCart, HiX, HiHeart } from "react-icons/hi";

export default function Header() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (session) {
      fetch("/api/cart")
        .then((res) => res.json())
        .then((data) => setCartCount(data.totalItems || 0))
        .catch(() => setCartCount(0));
    }
  }, [session]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header
      className="sticky top-0 z-50 px-3 py-2"
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div className="flex flex-col gap-2">
        {/* Top Row: Logos and Action Icons */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <img
                src="/logo_hmsi.jpg"
                alt="Logo HMSI"
                className="w-8 h-8 rounded-full object-cover shadow-sm"
              />
              <img
                src="/logo_siwira.png"
                alt="Logo SIWIRA"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[15px] leading-none tracking-wide text-slate-800">
                SIWIRA
              </span>
              <span
                className="text-[9px] font-medium leading-tight"
                style={{ color: "var(--primary-dark)" }}
              >
                Pasar Digital HMSI
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {session && (
              <>
                <Link
                  href="/wishlist"
                  className="p-1.5 rounded-full transition-colors relative"
                  style={{ color: "#475569" }}
                >
                  <HiHeart size={22} />
                </Link>
                <Link
                  href="/cart"
                  className="p-1.5 rounded-full transition-colors relative"
                  style={{ color: "#475569" }}
                >
                  <HiShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="floating-badge">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {!session ? (
              <Link
                href="/login"
                className="btn-primary text-xs !py-1.5 !px-3 shadow-md"
              >
                Masuk
              </Link>
            ) : null}
          </div>
        </div>

        {/* Bottom Row: Dense Search Bar */}
        <div className="w-full">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="relative">
              <HiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2"
                size={16}
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk kreatif HMSI..."
                className="w-full pl-9 pr-8 py-2 text-sm outline-none transition-colors"
                style={{
                  borderRadius: "8px",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  color: "var(--text-primary)",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full"
                  style={{ color: "var(--text-muted)" }}
                >
                  <HiX size={14} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
