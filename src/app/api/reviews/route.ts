import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/reviews?productId=xxx — Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get("productId");
    if (!productId) {
      return NextResponse.json(
        { error: "productId required" },
        { status: 400 },
      );
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      reviews,
      avgRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        reviews: [],
        avgRating: 0,
        totalReviews: 0,
      },
      { status: 500 },
    );
  }
}

// POST /api/reviews — Create or update a review
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { productId, rating, comment } = await request.json();

  if (!productId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "productId and rating (1-5) required" },
      { status: 400 },
    );
  }

  const review = await prisma.review.upsert({
    where: { userId_productId: { userId, productId } },
    update: { rating, comment: comment || null },
    create: { userId, productId, rating, comment: comment || null },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(review, { status: 201 });
}
