import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { database } from "@/lib/db";
import { carts, carts_items, product } from "@/lib/db/schema";

export async function POST(req: Request) {
  const { user_id, product_id } = await req.json();

  if (!user_id || !product_id) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  /* ======================
     FIND OR CREATE CART
  ====================== */
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

  /* ======================
     GET PRODUCT (VALIDATE)
  ====================== */
  const prod = await database
    .select()
    .from(product)
    .where(eq(product.id, product_id))
    .limit(1)
    .then((r) => r[0]);

  if (!prod || prod.stock <= 0) {
    return NextResponse.json({ error: "Out of stock" }, { status: 400 });
  }

  /* ======================
     CHECK EXISTING CART ITEM
  ====================== */
  const existingItem = await database
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

  /* ======================
     UPSERT LOGIC
  ====================== */
  if (existingItem) {
    // ✅ increment quantity
    await database
      .update(carts_items)
      .set({
        quantity: sql`${carts_items.quantity} + 1`,
      })
      .where(eq(carts_items.id, existingItem.id));
  } else {
    // ✅ insert new row
    await database.insert(carts_items).values({
      cart_id: cart.id,
      product_id,
      quantity: 1,
      price: prod.price,
    });
  }

  return NextResponse.json({ success: true });
}
