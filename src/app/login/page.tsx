"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "PENDING") {
          setError(
            "⏳ Akun Anda masih menunggu verifikasi admin. Mohon bersabar!",
          );
        } else if (result.error === "REJECTED") {
          setError(
            "❌ Maaf, akun Anda ditolak oleh admin. Silakan hubungi Himpunan.",
          );
        } else {
          setError(result.error);
        }
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 fade-in">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
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
          <h1 className="text-2xl font-bold gradient-text">Masuk</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Selamat datang kembali di HMSI UMKM
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@student.ac.id"
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">Password</label>
            <div className="relative">
              <HiLockClosed
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={18}
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="input-field pl-11 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              >
                {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3.5 !text-base"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </div>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        {/* Register link */}
        <p
          className="text-center mt-6 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold"
            style={{ color: "var(--primary-light)" }}
          >
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
