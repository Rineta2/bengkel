"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "@/utlis/firebase";
import { useAuth } from "@/utlis/context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Simpan token di localStorage
      localStorage.setItem("token", token);
      login(email, password); // Call login function from context

      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (error) {
      const errorMessage = error.message;
      if (error.code === "auth/user-not-found") {
        toast.error("Email tidak ditemukan. Silakan coba lagi.");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Kata sandi salah. Silakan coba lagi.");
      } else {
        toast.error(`Login error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
      setEmail("");
      setPassword("");
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error("Masukan email untuk mereset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(
        "Pesan reset ulang kata sandi telah terkirim. Periksa email Anda."
      );

      setTimeout(() => {
        setIsResetPassword(false);
        router.push("/");
      }, 2000);
    } catch (error) {
      const errorMessage = error.message;
      toast.error(`Password reset error: ${errorMessage}`);
    }
  };

  return (
    <section className="login">
      <div className="login__container container grid">
        <div className="content">
          <form onSubmit={handleSubmit}>
            <div className="form__box">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>

            {!isResetPassword && (
              <div className="form__box">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
            )}

            <div className="btn">
              {!isResetPassword ? (
                <button type="submit" className="login__btn" disabled={loading}>
                  {loading ? "Loading..." : "Login"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="login__btn"
                  disabled={loading}
                >
                  Lupa Password
                </button>
              )}
            </div>

            <div className="forgot-password">
              <button
                type="button"
                className="link"
                onClick={() => setIsResetPassword(!isResetPassword)}
              >
                {isResetPassword ? "Kembali Login" : "Lupa Password?"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
}
