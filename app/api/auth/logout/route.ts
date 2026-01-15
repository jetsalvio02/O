import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("user_id", "", { maxAge: 0, path: "/" });
  res.cookies.set("session_user", "", { maxAge: 0, path: "/" });
  return res;
}
