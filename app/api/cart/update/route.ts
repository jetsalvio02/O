import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { database } from "@/lib/db";
import { carts, carts_items } from "@/lib/db/schema";

export async function PATCH(req: Request) {
  const { user_id, product_id, quantity } = await req.json();

  if (!user_id || !product_id || quantity < 1) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // 1. Get the user's cart
  const [cart] = await database
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.user_id, user_id));

  if (!cart) {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }

  // 2. Update quantity in carts_items
  await database
    .update(carts_items)
    .set({ quantity })
    .where(
      and(
        eq(carts_items.cart_id, cart.id),
        eq(carts_items.product_id, product_id)
      )
    );

  return NextResponse.json({ success: true });
}
