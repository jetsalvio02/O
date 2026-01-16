import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  if (Number.isNaN(userId)) {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }

  const user = await database
    .select({
      id: users.id,
      address: users.address,
      phone: users.phone,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user.length) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user[0]);
}
