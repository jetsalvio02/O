import { database } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { prisma } from "@/lib/prisma";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const ALLOWED = new Set(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]);

export async function PATCH(request: Request) {
  const { order_id, status } = await request.json();

  if (!order_id || !status || !ALLOWED.has(status)) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  // const updated = await prisma.order.update({
  //   where: { id: Number(order_id) },
  //   data: { status },
  // });

  const updated = (
    await database
      .update(orders)
      .set({ status })
      .where(eq(orders.id, Number(order_id)))
      .returning()
  )[0];

  if (!updated) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
