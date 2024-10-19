// pages/_app.js (atau di RootLayout.js Anda)
"use client";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/utlis/context/AuthContext";
import ProtectedRoute from "@/components/auth/protect/ProtectedRoute"; // Impor yang benar
import { useRouter } from "next/navigation";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  const router = useRouter();
  const isLoginPage = router.pathname === "/";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          {isLoginPage ? children : <ProtectedRoute>{children}</ProtectedRoute>}
        </AuthProvider>
      </body>
    </html>
  );
}
