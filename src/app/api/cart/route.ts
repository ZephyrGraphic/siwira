import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/cart — Get current user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: { select: { id: true, name: true, phone: true } },
                category: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [], totalPrice: 0, totalItems: 0 });
    }

    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      items: cart.items,
      totalPrice,
      totalItems,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        items: [],
        totalPrice: 0,
        totalItems: 0,
      },
      { status: 500 },
    );
  }
}

// POST /api/cart — Add item to cart
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { productId, quantity = 1 } = await request.json();

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 },
    );
  }

  // Check product exists and has stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Produk tidak ditemukan" },
      { status: 404 },
    );
  }

  if (product.stock < quantity) {
    return NextResponse.json(
      { error: "Stok tidak mencukupi" },
      { status: 400 },
    );
  }

  // Prevent sellers from adding their own products
  if (product.sellerId === userId) {
    return NextResponse.json(
      { error: "Tidak bisa menambahkan produk sendiri" },
      { status: 400 },
    );
  }

  // Create or get cart
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  // Upsert cart item
  const cartItem = await prisma.cartItem.upsert({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      cartId: cart.id,
      productId,
      quantity,
    },
  });

  return NextResponse.json(cartItem, { status: 201 });
}

// PUT /api/cart — Update cart item quantity
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { cartItemId, quantity } = await request.json();

  if (!cartItemId || quantity === undefined) {
    return NextResponse.json(
      { error: "cartItemId and quantity are required" },
      { status: 400 },
    );
  }

  // Verify ownership
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }

  if (quantity <= 0) {
    // Remove item
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return NextResponse.json({ message: "Item dihapus" });
  }

  const updatedItem = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return NextResponse.json(updatedItem);
}

// DELETE /api/cart — Remove item from cart
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { cartItemId } = await request.json();

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });

  return NextResponse.json({ message: "Item dihapus dari keranjang" });
}
