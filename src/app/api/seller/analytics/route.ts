import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/seller/analytics — Get seller analytics data
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  // Get all products by this seller
  const products = await prisma.product.findMany({
    where: { sellerId: userId },
    include: {
      category: { select: { name: true } },
      reviews: { select: { rating: true } },
      orderItems: { select: { quantity: true, price: true } },
    },
  });

  // Calculate analytics
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;

  let totalRevenue = 0;
  let totalOrderItems = 0;
  const topProducts: { name: string; sold: number; revenue: number }[] = [];

  products.forEach((product) => {
    const sold = product.orderItems.reduce((s, oi) => s + oi.quantity, 0);
    const revenue = product.orderItems.reduce(
      (s, oi) => s + oi.price * oi.quantity,
      0,
    );
    totalRevenue += revenue;
    totalOrderItems += sold;

    topProducts.push({ name: product.name, sold, revenue });
  });

  topProducts.sort((a, b) => b.revenue - a.revenue);

  const avgRating =
    products.reduce((sum, p) => {
      if (p.reviews.length === 0) return sum;
      const productAvg =
        p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length;
      return sum + productAvg;
    }, 0) / (products.filter((p) => p.reviews.length > 0).length || 1);

  const totalReviews = products.reduce((s, p) => s + p.reviews.length, 0);

  return NextResponse.json({
    totalProducts,
    activeProducts,
    totalRevenue,
    totalOrderItems,
    avgRating: Math.round(avgRating * 10) / 10,
    totalReviews,
    topProducts: topProducts.slice(0, 5),
  });
}
