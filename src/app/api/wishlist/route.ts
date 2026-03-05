import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/wishlist — Get current user's wishlist
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const wishlist = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          seller: { select: { id: true, name: true } },
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(wishlist);
}

// POST /api/wishlist — Toggle wishlist (add if not exists, remove if exists)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { productId } = await request.json();

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 },
    );
  }

  // Check if already in wishlist
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });

  if (existing) {
    // Remove from wishlist
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return NextResponse.json({
      wishlisted: false,
      message: "Dihapus dari wishlist",
    });
  } else {
    // Add to wishlist
    await prisma.wishlist.create({
      data: { userId, productId },
    });
    return NextResponse.json({
      wishlisted: true,
      message: "Ditambahkan ke wishlist",
    });
  }
}
