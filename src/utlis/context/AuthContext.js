"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/utlis/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  getIdToken,
} from "firebase/auth";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await getIdToken(user);
        setUser(user);
        Cookies.set("authToken", token, { expires: 7 }); // Simpan token di cookies selama 7 hari
      } else {
        setUser(null);
        Cookies.remove("authToken"); // Hapus token jika user logout
      }
      setLoading(false); // Selesai memuat status autentikasi
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await getIdToken(user);
      Cookies.set("authToken", token, { expires: 7 }); // Simpan token di cookies
      setUser(user);
      toast.success(`Welcome back, ${user.email}`);
      router.push("/dashboard"); // Arahkan ke dashboard setelah login
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("authToken");
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/"); // Arahkan ke halaman home setelah logout
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const handleLoginError = (error) => {
    if (error instanceof Error) {
      switch (error.code) {
        case "auth/user-not-found":
          toast.error("Email tidak ditemukan. Silakan coba lagi.");
          break;
        case "auth/wrong-password":
          toast.error("Kata sandi salah. Silakan coba lagi.");
          break;
        case "auth/invalid-email":
          toast.error("Format email tidak valid. Periksa kembali email Anda.");
          break;
        default:
          toast.error(`Login error: ${error.message}`);
      }
    } else {
      toast.error("Terjadi kesalahan tidak diketahui.");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isLoggedIn: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
