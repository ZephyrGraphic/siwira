import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          phone: true,
          nim: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={JSON.parse(JSON.stringify(product))} />;
}
