"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { HiUsers, HiTag, HiShieldCheck, HiSearch } from "react-icons/hi";

interface PendingUser {
  id: string;
  nim: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  ktmImageUrl: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session || (session.user as any)?.role !== "ADMIN") {
      router.push("/");
      return;
    }
    fetchUsers();
  }, [session, sessionStatus, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?status=${filter}`);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    userId: string,
    approvalStatus: "APPROVED" | "REJECTED",
  ) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, approvalStatus }),
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nim.includes(searchQuery) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = [
    {
      label: "Menunggu",
      value: filter === "PENDING" ? filteredUsers.length : "—",
      icon: "⏳",
      color: "var(--warning)",
    },
  ];

  return (
    <div className="px-4 py-4 fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <HiShieldCheck size={24} style={{ color: "var(--primary-light)" }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Admin Dashboard
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Kelola pendaftaran dan kategori marketplace
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div
          className="glass-card p-4 cursor-pointer"
          onClick={() => setFilter("PENDING")}
          style={{
            borderColor:
              filter === "PENDING" ? "var(--primary)" : "transparent",
          }}
        >
          <HiUsers
            size={24}
            className="mb-2"
            style={{ color: "var(--primary-light)" }}
          />
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Verifikasi User
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Approve / Reject
          </p>
        </div>
        <Link href="/admin/categories" className="glass-card p-4 block">
          <HiTag
            size={24}
            className="mb-2"
            style={{ color: "var(--secondary)" }}
          />
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Kategori
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Kelola kategori
          </p>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "PENDING" as const, label: "Menunggu", icon: "⏳" },
          { key: "APPROVED" as const, label: "Disetujui", icon: "✅" },
          { key: "REJECTED" as const, label: "Ditolak", icon: "❌" },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-all"
            style={{
              background:
                filter === key ? "rgba(42, 184, 198, 0.15)" : "var(--bg-card)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: filter === key ? "var(--primary)" : "var(--border)",
              color:
                filter === key
                  ? "var(--primary-light)"
                  : "var(--text-secondary)",
            }}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <HiSearch
          className="absolute left-4 top-1/2 -translate-y-1/2"
          size={16}
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan nama, NIM, atau email..."
          className="input-field pl-10 text-sm"
        />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-4">
              <div className="flex gap-3">
                <div className="skeleton w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-3 w-3/4" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="glass-card p-4 slide-up">
              <div className="flex gap-3">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                  }}
                >
                  <span className="text-white font-bold text-lg">
                    {user.name.charAt(0)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3
                      className="font-semibold text-sm truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user.name}
                    </h3>
                    <StatusBadge status={user.approvalStatus} />
                  </div>
                  <p
                    className="text-xs mb-0.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    NIM: {user.nim}
                  </p>
                  <p
                    className="text-xs mb-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {user.email}
                  </p>
                  <p
                    className="text-xs mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Role: {user.role === "SELLER" ? "🏪 Penjual" : "🛒 Pembeli"}{" "}
                    • {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </p>

                  {/* KTM Preview */}
                  {user.ktmImageUrl && (
                    <div className="mb-3">
                      <img
                        src={user.ktmImageUrl}
                        alt="KTM"
                        className="w-full h-24 object-cover rounded-lg"
                        style={{
                          border: "1px solid var(--border)",
                        }}
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  {filter === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(user.id, "APPROVED")}
                        disabled={actionLoading === user.id}
                        className="btn-success flex-1"
                      >
                        {actionLoading === user.id ? "..." : "✅ Setujui"}
                      </button>
                      <button
                        onClick={() => handleAction(user.id, "REJECTED")}
                        disabled={actionLoading === user.id}
                        className="btn-danger flex-1"
                      >
                        {actionLoading === user.id ? "..." : "❌ Tolak"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 fade-in">
          <div className="text-4xl mb-3">
            {filter === "PENDING" ? "✅" : "📋"}
          </div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {filter === "PENDING"
              ? "Tidak ada pendaftaran baru"
              : `Tidak ada user ${filter.toLowerCase()}`}
          </p>
        </div>
      )}
    </div>
  );
}
