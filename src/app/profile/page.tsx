"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiUser,
  HiLogout,
  HiShieldCheck,
  HiShoppingBag,
  HiMail,
  HiIdentification,
  HiPhone,
  HiShoppingCart,
  HiHeart,
  HiTrendingUp,
  HiClipboardList,
} from "react-icons/hi";
import StatusBadge from "@/components/StatusBadge";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-4 py-16 text-center fade-in">
        <div className="text-5xl mb-4">👤</div>
        <h2
          className="text-xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Belum Login
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Masuk untuk melihat profil Anda
        </p>
        <Link href="/login" className="btn-primary">
          Masuk Sekarang
        </Link>
      </div>
    );
  }

  const user = session.user as any;

  return (
    <div className="px-4 py-4 fade-in">
      {/* Profile Card */}
      <div className="glass-card p-6 text-center mb-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            boxShadow: "0 8px 32px rgba(42, 184, 198, 0.3)",
          }}
        >
          <span className="text-white font-bold text-3xl">
            {user.name?.charAt(0) || "?"}
          </span>
        </div>
        <h2
          className="text-lg font-bold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          {user.name}
        </h2>
        <div className="flex items-center justify-center gap-2 mb-3">
          <StatusBadge status={user.approvalStatus} />
          <span
            className="badge"
            style={{
              background: "rgba(42, 184, 198, 0.15)",
              color: "var(--primary-light)",
              border: "1px solid rgba(42, 184, 198, 0.3)",
            }}
          >
            {user.role === "ADMIN"
              ? "🛡️ Admin"
              : user.role === "SELLER"
                ? "🏪 Penjual"
                : "🛒 Pembeli"}
          </span>
        </div>
      </div>

      {/* Info List */}
      <div className="space-y-3 mb-6">
        {[
          { icon: <HiMail size={20} />, label: "Email", value: user.email },
          {
            icon: <HiIdentification size={20} />,
            label: "NIM",
            value: user.nim,
          },
          {
            icon: <HiPhone size={20} />,
            label: "WhatsApp",
            value: user.phone || "Belum diisi",
          },
        ].map((item, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-4">
            <div style={{ color: "var(--primary-light)" }}>{item.icon}</div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {item.label}
              </p>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="space-y-3 mb-6">
        <Link
          href="/orders"
          className="glass-card p-4 flex items-center gap-4 block"
        >
          <HiClipboardList size={20} style={{ color: "#F97316" }} />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Pesanan Saya
          </span>
        </Link>
        <Link
          href="/wishlist"
          className="glass-card p-4 flex items-center gap-4 block"
        >
          <HiHeart size={20} style={{ color: "#EF4444" }} />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Wishlist
          </span>
        </Link>
        <Link
          href="/cart"
          className="glass-card p-4 flex items-center gap-4 block"
        >
          <HiShoppingCart size={20} style={{ color: "var(--primary)" }} />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Keranjang Belanja
          </span>
        </Link>
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="glass-card p-4 flex items-center gap-4 block"
          >
            <HiShieldCheck size={20} style={{ color: "var(--secondary)" }} />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Admin Dashboard
            </span>
          </Link>
        )}
        {(user.role === "SELLER" || user.role === "ADMIN") && (
          <>
            <Link
              href="/seller"
              className="glass-card p-4 flex items-center gap-4 block"
            >
              <HiShoppingBag
                size={20}
                style={{ color: "var(--primary-light)" }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Toko Saya
              </span>
            </Link>
            <Link
              href="/seller/analytics"
              className="glass-card p-4 flex items-center gap-4 block"
            >
              <HiTrendingUp size={20} style={{ color: "#22C55E" }} />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Analitik Penjualan
              </span>
            </Link>
          </>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full p-4 rounded-xl flex items-center justify-center gap-3 transition-all"
        style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#f87171",
        }}
      >
        <HiLogout size={20} />
        <span className="font-semibold text-sm">Keluar dari Akun</span>
      </button>
    </div>
  );
}
