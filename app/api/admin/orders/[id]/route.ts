import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);

  if (!orderId) {
    return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
  }

  try {
    const deleted = await database
      .delete(orders)
      .where(eq(orders.id, orderId))
      .returning({ id: orders.id });

    if (!deleted.length) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to delete order" },
      { status: 500 }
    );
  }
}
