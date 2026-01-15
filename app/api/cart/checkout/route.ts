import { database } from "@/lib/db";
import { carts } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { json } from "stream/consumers";

export async function POST(request: Request) {
  const { user_id, cartItemIds } = await request.json();

  await database
    .delete(carts)
    .where(and(eq(carts.user_id, user_id), inArray(carts.id, cartItemIds)));

  return NextResponse.json({ success: true });
}
