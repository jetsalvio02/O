import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { database } from "@/lib/db";
import { carts, carts_items, product } from "@/lib/db/schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("user_id"));

  if (!userId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }

  const rows = await database
    .select({
      cartItemId: carts_items.id,
      productId: product.id,
      name: product.name,
      price: carts_items.price,
      quantity: carts_items.quantity,
      stock: product.stock,
      image: product.image,
    })
    .from(carts)
    .innerJoin(carts_items, eq(carts_items.cart_id, carts.id))
    .innerJoin(product, eq(product.id, carts_items.product_id))
    .where(eq(carts.user_id, userId));

  return NextResponse.json(rows);
}
