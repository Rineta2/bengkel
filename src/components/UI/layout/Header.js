// In Header.js
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utlis/context/AuthContext";
import { navLink } from "@/components/UI/data/Header";

export default function Header() {
  const { handleLogout, user } = useAuth(); // Use handleLogout instead of logout
  const router = useRouter();

  const handleLogoutClick = async () => {
    try {
      await handleLogout(); // Call the correct function
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="header">
      <nav>
        <ul>
          {navLink.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      {user && (
        <button className="logout__btn" onClick={handleLogoutClick}>
          Logout
        </button>
      )}
    </header>
  );
}
