# 🛒 SIWIRA - Pasar Digital HMSI

![Next.js](https://img.shields.io/badge/Next.js-15.0+-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-Active-1B222D?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)

SIWIRA (Pasar Digital HMSI) adalah platform e-commerce dan marketplace yang didedikasikan untuk memberdayakan UMKM dan mahasiswa di lingkungan Sistem Informasi. Aplikasi ini dirancang dengan pendekatan _mobile-first_ dan estetika _glassmorphism_ untuk memberikan pengalaman belanja yang modern, mulus, dan _native-like_.

---

## ✨ Fitur Utama

Aplikasi ini memiliki sistem otorisasi multi-peran (Role-Based Access Control) yang terisolasi dengan aman:

### 👨‍💼 Admin (Moderator & Pengelola)

- **Verifikasi Pengguna**: Menyetujui (Approve) atau Menolak (Reject) pendaftaran penjual (Seller) dan pembeli baru berdasarkan KTM.
- **Manajemen Kategori**: Menambah, mengubah, dan menghapus kategori produk.
- **Moderasi Platform**: Memiliki hak akses penuh untuk melakukan _Take Down_ (Hapus Produk) yang melanggar aturan platform (menggunakan teknik _Soft Delete_ agar tidak merusak _Order History_).

### 🏪 Seller (Penjual / UMKM)

- **Toko & Etalase Cerdas**: Mengelola produk (CRUD) secara mandiri.
- **Manajemen Pesanan (Order Flow)**: Menerima atau membatalkan pesanan masuk.
- **Manajemen Stok Otomatis**: Jika pesanan masuk status `Pending`, stok otomatis ter-hold. Jika order di-_Void_ (Ditolak/Dibatalkan), stok akan dikembalikan (`increment`) secara otomatis ke etalase.

### 🛍️ Buyer (Pembeli Mahasiswa)

- **Eksplorasi Katalog**: Mencari produk, mem-filter berdasarkan kategori, dan melihat detail produk.
- **Keranjang & Wishlist**: Keranjang belanja yang terenkripsi dan terisolasi spesifik untuk masing-masing akun (_Private Cart per-Session_).
- **Social Proof**: Sistem ulasan (Rating & Review) terintegrasi pada setiap produk yang sudah dibeli.
- **Checkout instan via WhatsApp**: Kemudahan negosiasi dan pembayaran langsung berinteraksi dengan penjual menggunakan format pesan WhatsApp otomatis (termasuk total harga dan rincian kuantitas).

---

## 🛠️ Tech Stack & Arsitektur

- **Framework**: [Next.js (App Router)](https://nextjs.org/) dengan _Turbopack_ untuk performa kompilasi latensi rendah.
- **Language**: TypeScript (Type-safe).
- **Styling**: Vanilla CSS & TailwindCSS (Arsitektur variabel CSS modular dengan animasi _Fade & Slide-up_ tingkat tinggi).
- **Database**: PostgreSQL (Relational Database).
- **ORM**: Prisma Client.
- **Authentication**: NextAuth.js (`credentials` provider terenkripsi dengan _Bcrypt_ & _Server-Side Sessions_).

---

## 🚀 Panduan Instalasi (Development)

Pastikan Anda sudah menginstal **Node.js** (v18+) dan **PostgreSQL** di mesin lokal Anda.

1. **Clone repositori ini**

   ```bash
   git clone https://github.com/username-anda/siwira-hmsi-umkm.git
   cd siwira-hmsi-umkm
   ```

2. **Instal seluruh depedensi**

   ```bash
   npm install
   # atau
   yarn install
   # atau
   pnpm install
   ```

3. **Konfigurasi Environment (_.env_)**
   Buat file `.env` di _root directory_ dan sesuaikan koneksi database Anda:

   ```env
   # Ganti dengan URL PostgreSQL milik Anda (lokal / Supabase / Neon, dsb)
   DATABASE_URL="postgresql://user:password@localhost:5432/siwira_db?schema=public"

   # Secret Key untuk mengenkripsi Sesi (Minimal 32 Karakter Random)
   NEXTAUTH_SECRET="masukkan_rahasia_sepanjang_32_karakter_di_sini"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Migrasi Database & Sinkronisasi**
   Jalankan perintah prisma untuk me-_push_ skema database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Jalankan _Development Server_**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan pada port **3000**. Silakan akses `http://localhost:3000` di _browser_.

---

## 📂 Struktur Direktori (_Highlight_)

```plaintext
src/
├── app/
│   ├── admin/       # Dashboard & Rute khusus role Admin
│   ├── api/         # Next.js Serverless Route Handlers (Auth, Cart, Orders, dll)
│   ├── cart/        # Halaman Keranjang Belanja & Checkout logic
│   ├── explore/     # Etalase Publik & Algoritma Filter
│   ├── product/     # Detail Produk (Dynamic Routing [id])
│   ├── seller/      # Dashboard Manajemen Produk UMKM
│   └── globals.css  # Utility classes & CSS Design Token SIWIRA
├── components/      # UI Reusable (ProductCard, StatusBadge, dll)
├── lib/             # Helpers (authOptions, prismaClient, formatter)
└── prisma/
    └── schema.prisma # Konfigurasi Database & Model Relasi
```

---

## 🔒 Security & Best Practices

- **API Route Protection**: Seluruh rute API yang bersifat manipulatif (`POST, PUT, PATCH, DELETE`) dilindungi menggunakan validasi _server-side session_.
- **Graceful Error Handling**: Kegagalan _query_ ke _database_ di-_catch_ dengan benar tanpa merusak (_crash_) sisi pengguna, melainkan mengembalikan format JSON _Error_ (`500 Internal Server Error`).
- **Defensive UI**: Penggunaan `res.ok` validasi sebelum _parsing JSON_, untuk menangani masalah pada jaringan yang buruk.

---

_Dibuat dengan ❤️ untuk Mahasiswa dan Ekosistem Bisnis SI_
