import { database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  const hashed_password = await bcrypt.hash(password, 10);

  // const user = await prisma.user.create({
  //   data: {
  //     name,
  //     email,
  //     password: hashed_password,
  //     role: "CUSTOMER",
  //   },
  // });

  const [user] = await database
    .insert(users)
    .values({ name, email, password: hashed_password, role: "CUSTOMER" })
    .returning({ id: users.id });

  return NextResponse.json({
    message: "User Registered successfully",
    user_id: user.id,
  });
}
