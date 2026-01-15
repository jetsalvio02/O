import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/admin",
  "/admin_products",
  "/dashboard",
  "/orders",
  "/reports",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("session_user")?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let user: { role?: string } | null = null;
  try {
    user = JSON.parse(sessionCookie);
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin_products/:path*",
    "/dashboard/:path*",
    "/orders/:path*",
    "/reports/:path*",
  ],
};
