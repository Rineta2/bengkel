import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utlis/context/AuthContext";
import { navLink } from "@/components/UI/data/Header";
import Link from "next/link";
import img from "@/components/assets/dashboard/user/img.png";
import Image from "next/image";
import { Search } from "lucide-react";

import { usePathname } from "next/navigation";
export default function Header() {
  const { handleLogout, user } = useAuth();

  const [active, setActive] = useState("dashboard");

  const pathname = usePathname();

  const router = useRouter();

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="header">
      <div className="profile">
        <div className="img">
          <Image src={img} alt="img" loading="lazy" quality={100} />
        </div>

        <div className="text">
          {user ? (
            <>
              <h2>{user.displayName || "Admin"}</h2>
              <p>{user.email || "Email not available"}</p>
            </>
          ) : (
            <h2>Welcome!</h2>
          )}
        </div>
      </div>

      <div className="search">
        <Search size={30} />
        <input type="text" placeholder="Search" />
      </div>

      <nav className="nav">
        <ul className="nav__list">
          {navLink.map((link) => (
            <li
              key={link.id}
              className={`nav__item ${pathname === link.path ? "active" : ""}`}
            >
              <Link href={link.path} className="nav__link">
                {link.icon}
                {link.name}
              </Link>
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
