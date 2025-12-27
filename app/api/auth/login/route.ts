import { database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // const user = await prisma.user.findUnique({
  //   where: { email },
  // });

  const result = await database
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];

  if (!user) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const is_match = await bcrypt.compare(password, user.password);

  if (!is_match) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: "Login successfully",
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  });
}
