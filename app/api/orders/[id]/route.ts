import { database } from "@/lib/db";
import { orders, orders_items, product } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user_id = Number(id);

  // 🔒 VALIDATION
  if (!id || Number.isNaN(user_id)) {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }

  const rows = await database
    .select({
      order_id: orders.id,
      order_status: orders.status,
      order_total: orders.total,
      order_created_at: orders.created_at,

      item_id: orders_items.id,
      quantity: orders_items.quantity,

      product_id: product.id,
      product_name: product.name,
      product_image: product.image,
    })
    .from(orders)
    .leftJoin(orders_items, eq(orders_items.order_id, orders.id))
    .leftJoin(product, eq(product.id, orders_items.product_id))
    .where(eq(orders.user_id, user_id))
    .orderBy(desc(orders.created_at));

  const orders_map: Record<number, any> = {};

  for (const row of rows) {
    if (!orders_map[row.order_id]) {
      orders_map[row.order_id] = {
        id: row.order_id,
        status: row.order_status,
        total: row.order_total,
        created_at: row.order_created_at,
        items: [],
      };
    }

    if (row.item_id) {
      orders_map[row.order_id].items.push({
        id: row.item_id,
        quantity: row.quantity,
        product: {
          id: row.product_id,
          name: row.product_name,
          image: row.product_image,
        },
      });
    }
  }

  return NextResponse.json(Object.values(orders_map));
}
