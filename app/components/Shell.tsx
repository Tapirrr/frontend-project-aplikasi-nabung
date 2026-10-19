"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/app/components/ui";
import { LogOutIcon } from "@/app/components/Icons";

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth();
  const path = usePathname();
  const r = useRouter();
  const publik = path === "/login" || path === "/";

  useEffect(() => {
    if (ready && !user && !publik) r.replace("/login");
  }, [ready, user, publik, r]);

  if (publik) return <>{children}</>;
  if (!ready || !user) return null;

  const nav = [
    ["/tabungan", "Tabungan"],
    ["/transaksi", "Transaksi"],
    ["/profil", "Profil"],
    ...(user.role === "admin" ? [["/users", "Pengguna"]] : []),
  ];

  return (
    <>
      <header className="top">
        <Link href="/tabungan" style={{ textDecoration: "none" }}>
          <span className="brand">Celengan</span>
        </Link>

        <nav>
          {nav.map(([h, n]) => (
            <Link key={h} href={h}>
              <button className={path === h ? "on" : ""}>{n}</button>
            </Link>
          ))}
        </nav>

        <div className="me">
          <div className="user-chip">
            <Avatar u={user} />
            <span className="user-name-text">{user.username}</span>
            {user.role === "admin" && <span className="pill admin" style={{ fontSize: "11px", padding: "1px 6px" }}>Admin</span>}
          </div>
          <button className="btn sm" onClick={logout} title="Keluar">
            <LogOutIcon className="w-4 h-4" />
            <span className="user-name-text">Keluar</span>
          </button>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
