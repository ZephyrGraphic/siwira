import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/orders/[id]/status — Update order status (seller confirms/completes)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Get current order to check previous status
  const currentOrder = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!currentOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // If cancelling an order that isn't already cancelled, revert the stock
  if (status === "CANCELLED" && currentOrder.status !== "CANCELLED") {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Update order status
      const order = await tx.order.update({
        where: { id },
        data: { status },
        include: {
          items: { include: { product: true } },
        },
      });

      // 2. Revert stock for all items
      for (const item of currentOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return order;
    });

    return NextResponse.json(updatedOrder);
  }

  // Otherwise just update the status normally
  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  return NextResponse.json(order);
}
