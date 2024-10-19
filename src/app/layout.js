"use client";

import "@/components/styles/globals.scss";

import { AuthProvider } from "@/utlis/context/AuthContext";

import ProtectedRoute from "@/components/auth/protect/ProtectedRoute";

import { useRouter } from "next/navigation";

export default function RootLayout({ children }) {
  const router = useRouter();
  const isLoginPage = router.pathname === "/";

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {isLoginPage ? children : <ProtectedRoute>{children}</ProtectedRoute>}
        </AuthProvider>
      </body>
    </html>
  );
}
