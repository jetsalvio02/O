import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return NextResponse.json(null, { status: 401 });
  }

  const user = await database
    .select({
      id: users.id,
      address: users.address,
      phone: users.phone,
    })
    .from(users)
    .where(eq(users.id, Number(userId)))
    .limit(1);

  if (!user.length) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json(user[0]);
}
