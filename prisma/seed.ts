import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@hmsi.ac.id" },
    update: {},
    create: {
      nim: "ADMIN001",
      name: "Admin HMSI",
      email: "admin@hmsi.ac.id",
      password: adminPassword,
      phone: "081234567890",
      role: "ADMIN",
      approvalStatus: "APPROVED",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Create Sample Seller
  const sellerPassword = await bcrypt.hash("seller123", 12);
  const seller = await prisma.user.upsert({
    where: { email: "seller@student.ac.id" },
    update: {},
    create: {
      nim: "20210001",
      name: "Budhi Seller",
      email: "seller@student.ac.id",
      password: sellerPassword,
      phone: "081298765432",
      role: "SELLER",
      approvalStatus: "APPROVED",
    },
  });
  console.log("✅ Seller created:", seller.email);

  // Create Categories
  const categoriesData = [
    { name: "Makanan", icon: "🍜" },
    { name: "Minuman", icon: "🥤" },
    { name: "Merchandise", icon: "👕" },
    { name: "Jasa", icon: "💼" },
    { name: "Produk Digital", icon: "💻" },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categories.push(category);
  }
  console.log("✅ Categories created:", categories.length);

  // Create Sample Products
  const productsData = [
    {
      name: "Seblak Original Khas Bandung",
      description:
        "Seblak kerupuk original dengan bumbu racikan khas Bandung. Tersedia level pedas 1-5. Porsi besar dan mengenyangkan!",
      price: 15000,
      stock: 50,
      categoryId: categories[0].id,
    },
    {
      name: "Dimsum Ayam Premium",
      description:
        "Dimsum ayam homemade dengan isian daging ayam pilihan. Dikukus fresh setiap hari. 1 box isi 8 pcs.",
      price: 25000,
      stock: 30,
      categoryId: categories[0].id,
    },
    {
      name: "Es Kopi Susu Aren",
      description:
        "Es kopi susu dengan gula aren asli. Menggunakan biji kopi arabica pilihan dari Toraja. Fresh brew setiap hari.",
      price: 18000,
      stock: 100,
      categoryId: categories[1].id,
    },
    {
      name: "Matcha Latte Premium",
      description:
        "Matcha latte dengan matcha grade A dari Jepang. Bisa request less sugar atau extra shot.",
      price: 22000,
      stock: 80,
      categoryId: categories[1].id,
    },
    {
      name: "Kaos HMSI Limited Edition",
      description:
        "Kaos HMSI edisi terbatas dengan desain eksklusif. Bahan cotton combed 30s, nyaman dipakai sehari-hari.",
      price: 85000,
      stock: 25,
      categoryId: categories[2].id,
    },
    {
      name: "Sticker Pack SI",
      description:
        "Sticker pack bertema Sistem Informasi. 1 pack isi 10 sticker vinyl waterproof. Cocok untuk laptop dan botol minum!",
      price: 15000,
      stock: 200,
      categoryId: categories[2].id,
    },
    {
      name: "Jasa Desain Logo",
      description:
        "Jasa desain logo profesional untuk bisnis UMKM. Include 3 konsep & 2x revisi. Pengerjaan 3-5 hari kerja.",
      price: 150000,
      stock: 10,
      categoryId: categories[3].id,
    },
    {
      name: "Template Website Portfolio",
      description:
        "Template website portfolio modern dan responsive. Built with Next.js + Tailwind CSS. Include dokumentasi setup.",
      price: 50000,
      stock: 999,
      categoryId: categories[4].id,
    },
  ];

  for (const product of productsData) {
    await prisma.product.create({
      data: {
        ...product,
        sellerId: seller.id,
      },
    });
  }
  console.log("✅ Products created:", productsData.length);

  // Create a pending user for demo
  const pendingPassword = await bcrypt.hash("pending123", 12);
  await prisma.user.upsert({
    where: { email: "pending@student.ac.id" },
    update: {},
    create: {
      nim: "20210099",
      name: "Calon Seller",
      email: "pending@student.ac.id",
      password: pendingPassword,
      phone: "081377788899",
      role: "SELLER",
      approvalStatus: "PENDING",
    },
  });
  console.log("✅ Pending user created for demo");

  console.log("\n🎉 Seeding completed!");
  console.log("---------------------------");
  console.log("Admin Login: admin@hmsi.ac.id / admin123");
  console.log("Seller Login: seller@student.ac.id / seller123");
  console.log("Pending User: pending@student.ac.id / pending123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
