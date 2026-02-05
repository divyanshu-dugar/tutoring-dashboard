// src/proxy.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = req.nextUrl.pathname;

  if (!token && (pathname.startsWith("/parent") || pathname.startsWith("/instructor"))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/parent") && token?.role !== "parent") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/instructor") && token?.role !== "instructor") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/parent/:path*", "/instructor/:path*"],
};
