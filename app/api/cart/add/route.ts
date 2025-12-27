import { database } from "@/lib/db";
import { carts, carts_items, product } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { user_id, product_id } = await request.json();

  if (!user_id || !product_id) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  let cart = await database
    .select()
    .from(carts)
    .where(eq(carts.user_id, user_id))
    .limit(1)
    .then((r) => r[0]);

  if (!cart) {
    cart = await database
      .insert(carts)
      .values({ user_id })
      .returning()
      .then((r) => r[0]);
  }

  const prod = await database
    .select()
    .from(product)
    .where(eq(product.id, product_id))
    .limit(1)
    .then((r) => r[0]);

  if (prod.stock <= 0 || !prod) {
    return NextResponse.json({ error: "Out of Stock" }, { status: 400 });
  }

  const existing = await database
    .select()
    .from(carts_items)
    .where(
      and(
        eq(carts_items.cart_id, cart.id),
        eq(carts_items.product_id, product_id)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (existing) {
    await database
      .update(carts_items)
      .set({ quantity: sql`${carts_items.quantity} + 1` })
      .where(eq(carts_items.id, existing.id));
  } else {
    await database.insert(carts_items).values({
      cart_id: cart.id,
      product_id,
      quantity: 1,
      price: prod.price,
    });
  }

  return NextResponse.json({ success: true });
}
