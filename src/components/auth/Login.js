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
import { User, EyeOff, Eye } from "lucide-react";
import Image from "next/image";
import image from "@/components/assets/login/login.png";
import "@/components/styles/login.scss";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      toast.error("Terjadi kesalahan saat login. Silakan coba lagi.");
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
        router.push("/login");
      }, 2000);
    } catch (error) {
      toast.error(`Password reset error: ${error.message}`);
    }
  };

  return (
    <section className="login">
      <div className="login__container container grid">
        <div className="content">
          <div className="img">
            <Image src={image} quality={100} alt="image-login" />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form__box">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
              <User size={40} />
            </div>
            {!isResetPassword && (
              <div className="form__box">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="eye-button"
                >
                  {showPassword ? <Eye size={40} /> : <EyeOff size={40} />}
                </div>
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
                  className="reset__btn"
                  disabled={loading}
                >
                  Lupa Password
                </button>
              )}
            </div>
            <div className="forgot-password">
              <div
                className="link"
                onClick={() => setIsResetPassword(!isResetPassword)}
              >
                {isResetPassword ? "Kembali Login" : "Lupa Password?"}
              </div>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
}
