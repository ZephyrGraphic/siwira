import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://siwira.vercel.app"),
  title: "SIWIRA - Pasar Digital HMSI",
  description:
    "Marketplace digital mahasiswa Sistem Informasi - HMSI Universitas Nusa Putra. Temukan dan jual produk UMKM terbaik!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIWIRA",
  },
  openGraph: {
    title: "SIWIRA - Pasar Digital HMSI",
    description:
      "Marketplace digital mahasiswa Sistem Informasi - HMSI Universitas Nusa Putra. Temukan dan jual produk UMKM terbaik!",
    url: "https://siwira.vercel.app",
    siteName: "SIWIRA",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIWIRA - Pasar Digital HMSI",
    description:
      "Marketplace digital mahasiswa Sistem Informasi - HMSI Universitas Nusa Putra.",
  },
};

export const viewport: Viewport = {
  themeColor: "#2AB8C6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/logo_siwira.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <div className="page-container">
            <Header />
            <main>{children}</main>
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
