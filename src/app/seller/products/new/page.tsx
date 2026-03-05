"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiArrowLeft,
  HiPhotograph,
  HiCurrencyDollar,
  HiCube,
  HiTag,
} from "react-icons/hi";

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export default function NewProductPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetchCategories();
  }, [session, sessionStatus]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
      setCategories([]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadResult = await uploadRes.json();
        if (uploadRes.ok) {
          imageUrl = uploadResult.url;
        }
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal menambahkan produk");
        return;
      }

      router.push("/seller");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-4 fade-in">
      {/* Back */}
      <Link
        href="/seller"
        className="flex items-center gap-2 mb-4 text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        <HiArrowLeft size={16} /> Kembali ke Toko
      </Link>

      <h1
        className="text-xl font-bold mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        Tambah Produk Baru
      </h1>

      {error && (
        <div
          className="mb-4 p-4 rounded-xl text-sm slide-up"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div>
          <label className="input-label">Foto Produk</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl overflow-hidden transition-all"
            style={{
              background: "var(--bg-card)",
              border: `2px dashed ${
                imagePreview ? "var(--success)" : "var(--border)"
              }`,
            }}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="py-12 text-center">
                <HiPhotograph
                  size={48}
                  className="mx-auto mb-3"
                  style={{ color: "var(--text-muted)" }}
                />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Klik untuk upload foto produk
                </p>
              </div>
            )}
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="input-label">Nama Produk</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Contoh: Seblak Original"
            className="input-field"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="input-label">Deskripsi</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange as any}
            placeholder="Deskripsikan produk Anda..."
            rows={4}
            className="input-field resize-none"
            required
          />
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">Harga (Rp)</label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Rp
              </span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                className="input-field pl-10"
                min="0"
                required
              />
            </div>
          </div>
          <div>
            <label className="input-label">Stok</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              className="input-field"
              min="0"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="input-label">Kategori</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Pilih kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon || "📦"} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full !py-3.5 !text-base"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </div>
          ) : (
            "Simpan Produk"
          )}
        </button>
      </form>
    </div>
  );
}
