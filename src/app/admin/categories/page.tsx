"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HiTag, HiPlus, HiTrash, HiArrowLeft } from "react-icons/hi";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  _count: { products: number };
}

export default function CategoriesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session || (session.user as any)?.role !== "ADMIN") {
      router.push("/");
      return;
    }
    fetchCategories();
  }, [session, sessionStatus]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, icon: newIcon || null }),
      });
      if (res.ok) {
        setNewName("");
        setNewIcon("");
        fetchCategories();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      fetchCategories();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="px-4 py-4 fade-in">
      {/* Back */}
      <Link
        href="/admin"
        className="flex items-center gap-2 mb-4 text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        <HiArrowLeft size={16} /> Kembali ke Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <HiTag size={24} style={{ color: "var(--secondary)" }} />
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Kelola Kategori
        </h1>
      </div>

      {/* Add Category Form */}
      <form onSubmit={handleAdd} className="glass-card p-4 mb-6">
        <h3
          className="font-semibold text-sm mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Tambah Kategori Baru
        </h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            placeholder="Icon (emoji)"
            className="input-field w-20 text-center text-lg"
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama kategori"
            className="input-field flex-1"
            required
          />
        </div>
        <button type="submit" disabled={adding} className="btn-primary w-full">
          <HiPlus size={18} />
          {adding ? "Menambahkan..." : "Tambah Kategori"}
        </button>
      </form>

      {/* Categories List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-3">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="glass-card p-4 flex items-center justify-between slide-up"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{
                    background: "rgba(42, 184, 198, 0.1)",
                    border: "1px solid rgba(42, 184, 198, 0.15)",
                  }}
                >
                  {cat.icon || "📦"}
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {cat.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {cat._count.products} produk
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--danger)" }}
              >
                <HiTrash size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📂</div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Belum ada kategori
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Tambahkan kategori pertama di atas
          </p>
        </div>
      )}
    </div>
  );
}
