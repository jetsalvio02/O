import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { carts_items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  const { cartItemId, quantity } = await req.json();

  if (!cartItemId || quantity < 1) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }

  const updated = await database
    .update(carts_items)
    .set({ quantity })
    .where(eq(carts_items.id, cartItemId))
    .returning();

  if (!updated.length) {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
