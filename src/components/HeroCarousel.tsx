"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const banners = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&h=400&fit=crop",
    title: "Sale Akhir Bulan!",
    subtitle: "Dapatkan diskon hingga 50% untuk semua merchandise SI.",
    link: "/category/merchandise",
    color: "var(--secondary)",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&h=400&fit=crop",
    title: "Bazar Makanan Lokal",
    subtitle: "Dukung UMKM mahasiswa lewat Bazar Makanan.",
    link: "/category/makanan",
    color: "var(--primary)",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?q=80&w=800&h=400&fit=crop",
    title: "Jasa Desain Premium",
    subtitle: "Butuh desain UI/UX? Temukan talent mahasiswa SI di sini.",
    link: "/category/jasa",
    color: "var(--accent)",
  },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 4000); // Change banner every 4 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full rounded-xl overflow-hidden mb-5 aspect-[21/9] shadow-md group">
      {/* Banner Slides */}
      <div
        className="flex w-full h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full h-full relative">
            {/* Background Image */}
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay for Text Readability */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.3) 60%, transparent 100%)",
              }}
            />
            {/* Text Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-5 max-w-[75%]">
              <span
                className="text-[10px] font-bold uppercase tracking-wider mb-1 px-2 py-0.5 rounded-full w-fit shadow-sm"
                style={{ background: banner.color, color: "white" }}
              >
                Promo Hangat
              </span>
              <h2 className="text-xl font-extrabold text-white leading-tight mb-1.5 drop-shadow-md">
                {banner.title}
              </h2>
              <p className="text-[11px] font-medium text-slate-200 line-clamp-2 leading-snug drop-shadow-sm">
                {banner.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? "w-4 bg-white shadow-sm"
                : "w-1.5 bg-white/50"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
