import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user_id = Number(params.id);

  const orders = await prisma.order.findMany({
    where: { user_id },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(orders);
}
