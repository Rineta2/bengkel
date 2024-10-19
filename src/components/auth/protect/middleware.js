// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  // Ambil token dari cookie
  const token = request.cookies.get("token"); // Misalkan token disimpan dalam cookie

  // Cek apakah token ada
  if (!token) {
    // Jika tidak ada token, redirect ke halaman login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika ada token, lanjutkan permintaan
  return NextResponse.next();
}

// Tentukan path yang ingin Anda proteksi
export const config = {
  matcher: ["/protected/**"], // Ganti dengan path yang ingin Anda proteksi
};
