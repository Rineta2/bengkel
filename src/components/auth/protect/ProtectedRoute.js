// components/ProtectedRoute.js
"use client";
import { useAuth } from "@/utlis/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      // Jika pengguna tidak login, arahkan ke halaman login
      router.push("/");
    }
  }, [isLoggedIn, loading, router]);

  if (loading) {
    return <div>Loading...</div>; // Tampilkan loading saat memuat status autentikasi
  }

  return children; // Render anak komponen jika pengguna sudah login
};

export default ProtectedRoute;
