"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiUser,
  HiMail,
  HiLockClosed,
  HiPhone,
  HiIdentification,
  HiPhotograph,
  HiCheckCircle,
} from "react-icons/hi";

export default function RegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    nim: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "BUYER",
  });
  const [ktmFile, setKtmFile] = useState<File | null>(null);
  const [ktmPreview, setKtmPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKtmFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setKtmPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      let ktmImageUrl = null;

      // Upload KTM if provided
      if (ktmFile) {
        const uploadData = new FormData();
        uploadData.append("file", ktmFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadResult = await uploadRes.json();
        if (uploadRes.ok) {
          ktmImageUrl = uploadResult.url;
        }
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ktmImageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 fade-in">
        <div className="text-center w-full max-w-sm">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(34, 197, 94, 0.15)",
              border: "2px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <HiCheckCircle size={48} style={{ color: "var(--success)" }} />
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Pendaftaran Berhasil! 🎉
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Akun Anda sedang menunggu verifikasi admin. Kami akan menghubungi
            Anda setelah proses verifikasi selesai.
          </p>
          <div
            className="p-4 rounded-xl mb-6"
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--warning)" }}>
              ⏳ Status: <strong>Menunggu Verifikasi</strong>
            </p>
          </div>
          <Link href="/login" className="btn-primary w-full !py-3">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 fade-in">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              boxShadow: "0 8px 32px rgba(42, 184, 198, 0.3)",
            }}
          >
            <span className="text-white font-bold text-2xl">SI</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Daftar Akun</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Bergabung dengan marketplace mahasiswa SI
          </p>
        </div>

        {/* Error */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="input-label">Nama Lengkap</label>
            <div className="relative">
              <HiUser
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={18}
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama lengkap"
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          {/* NIM */}
          <div>
            <label className="input-label">NIM (Nomor Induk Mahasiswa)</label>
            <div className="relative">
              <HiIdentification
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={18}
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                name="nim"
                value={formData.nim}
                onChange={handleChange}
                placeholder="Contoh: 20210001"
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="input-label">Email</label>
            <div className="relative">
              <HiMail
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={18}
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@student.ac.id"
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="input-label">No. WhatsApp</label>
            <div className="relative">
              <HiPhone
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={18}
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className="input-field pl-11"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="input-label">Daftar Sebagai</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "BUYER", label: "Pembeli", icon: "🛒" },
                { value: "SELLER", label: "Penjual", icon: "🏪" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, role: option.value })
                  }
                  className="p-3 rounded-xl text-center transition-all"
                  style={{
                    background:
                      formData.role === option.value
                        ? "rgba(42, 184, 198, 0.15)"
                        : "var(--bg-card)",
                    border: `1px solid ${
                      formData.role === option.value
                        ? "var(--primary)"
                        : "var(--border)"
                    }`,
                  }}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div
                    className="text-xs font-semibold"
                    style={{
                      color:
                        formData.role === option.value
                          ? "var(--primary-light)"
                          : "var(--text-secondary)",
                    }}
                  >
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="input-label">Password</label>
            <div className="relative">
              <HiLockClosed
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={18}
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                className="input-field pl-11"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="input-label">Konfirmasi Password</label>
            <div className="relative">
              <HiLockClosed
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={18}
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          {/* KTM Upload */}
          <div>
            <label className="input-label">
              Upload KTM / Kartu Tanda Mahasiswa
            </label>
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
              className="w-full p-4 rounded-xl text-center transition-all"
              style={{
                background: "var(--bg-card)",
                border: `2px dashed ${
                  ktmPreview ? "var(--success)" : "var(--border)"
                }`,
              }}
            >
              {ktmPreview ? (
                <div className="space-y-2">
                  <img
                    src={ktmPreview}
                    alt="KTM Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <p className="text-xs" style={{ color: "var(--success)" }}>
                    ✅ KTM berhasil diupload. Klik untuk ganti.
                  </p>
                </div>
              ) : (
                <div>
                  <HiPhotograph
                    size={32}
                    className="mx-auto mb-2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Klik untuk upload foto KTM
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    JPG, PNG (Max 5MB)
                  </p>
                </div>
              )}
            </button>
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
                Mendaftar...
              </div>
            ) : (
              "Daftar Sekarang"
            )}
          </button>
        </form>

        {/* Login link */}
        <p
          className="text-center mt-6 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold"
            style={{ color: "var(--primary-light)" }}
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
