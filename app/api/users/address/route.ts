import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  try {
    const { user_id, address, phone } = await req.json();

    if (!user_id || !address?.trim() || !phone?.trim()) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const updated = (
      await database
        .update(users)
        .set({
          address: address.trim(),
          phone: phone.trim(),
        })
        .where(eq(users.id, user_id))
        .returning()
    )[0];

    if (!updated) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE ADDRESS ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
