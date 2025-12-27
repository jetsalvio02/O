import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { database } from "@/lib/db";
import { carts, carts_items } from "@/lib/db/schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("user_id"));

  if (!userId) {
    return NextResponse.json({ count: 0 });
  }

  const result = await database
    .select({
      count: sql<number>`COALESCE(SUM(${carts_items.quantity}), 0)`,
    })
    .from(carts)
    .leftJoin(carts_items, eq(carts.id, carts_items.cart_id))
    .where(eq(carts.user_id, userId));

  return NextResponse.json({ count: result[0]?.count ?? 0 });
}
