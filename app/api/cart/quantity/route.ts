import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { carts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  try {
    const { cartItemId, quantity } = await req.json();

    if (!cartItemId || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    await database
      .update(carts)
      .set({ quantity })
      .where(eq(carts.id, cartItemId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quantity update error:", error);
    return NextResponse.json(
      { error: "Failed to update quantity" },
      { status: 500 }
    );
  }
}
