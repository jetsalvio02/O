import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { database } from "@/lib/db";
import { carts } from "@/lib/db/schema";

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  await database.delete(carts).where(eq(carts.user_id, Number(params.userId)));
  return NextResponse.json({ success: true });
}
