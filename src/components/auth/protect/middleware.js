import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token");

  // Mengarahkan ke halaman login jika token tidak ada
  if (!token && request.nextUrl.pathname.startsWith("/protected")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/protected/**"],
};
