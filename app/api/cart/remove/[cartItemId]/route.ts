import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { database } from "@/lib/db";
import { carts_items } from "@/lib/db/schema";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ cartItemId: string }> }
) {
  // ✅ UNWRAP PARAMS
  const { cartItemId } = await context.params;

  const id = Number(cartItemId);

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "Invalid cartItemId" }, { status: 400 });
  }

  await database.delete(carts_items).where(eq(carts_items.id, id));

  return NextResponse.json({ success: true });
}
