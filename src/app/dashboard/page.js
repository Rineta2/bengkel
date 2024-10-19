"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/utlis/context/AuthContext";

export default function Dashboard() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!isLoggedIn || !token) {
      router.push("/"); // Arahkan ke halaman login jika tidak ada token
    }
  }, [isLoggedIn, router]);

  const handleLogout = () => {
    logout(); // Panggil fungsi logout dari context
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
