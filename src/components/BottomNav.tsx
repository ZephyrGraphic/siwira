"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { HiHome, HiSearch, HiShoppingBag, HiUser } from "react-icons/hi";

const navItems = [
  { href: "/", icon: HiHome, label: "Beranda" },
  { href: "/explore", icon: HiSearch, label: "Cari" },
  { href: "/seller", icon: HiShoppingBag, label: "Toko" },
  { href: "/profile", icon: HiUser, label: "Profil" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Ensure navbar is visible for all roles

  // Don't show on login/register pages
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200"
              style={{
                color: isActive ? "var(--secondary)" : "#94a3b8",
              }}
            >
              <div className="relative">
                <Icon
                  size={22}
                  style={{
                    transition: "transform 0.2s ease",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                />
                {isActive && (
                  <div
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: "var(--secondary)" }}
                  />
                )}
              </div>
              <span
                className="text-[10px]"
                style={{
                  transition: "all 0.2s ease",
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? "var(--secondary)" : "#94a3b8",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
