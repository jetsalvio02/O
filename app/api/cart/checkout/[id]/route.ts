import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { carts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cartItemId = Number(id);

  if (!cartItemId || Number.isNaN(cartItemId)) {
    return NextResponse.json(
      { message: "Invalid cart item ID" },
      { status: 400 }
    );
  }

  await database.delete(carts).where(eq(carts.id, cartItemId));

  return NextResponse.json({ success: true });
}
