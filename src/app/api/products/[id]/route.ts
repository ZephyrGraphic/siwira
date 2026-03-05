import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE: Hapus produk (Hanya Pemilik atau Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const productId = params.id;

    // Cari produk
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    // Pastikan yang menghapus adalah pemiliknya ATAU admin
    if (product.sellerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk menghapus produk ini" },
        { status: 403 },
      );
    }

    // Update produk menjadi tidak aktif (Soft delete)
    // agar order history tidak rusak
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    return NextResponse.json(
      { message: "Produk berhasil dihapus" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
