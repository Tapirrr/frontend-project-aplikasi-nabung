"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/app/components/ui";

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
        <div className="brand">Celengan</div>
        <nav>
          {nav.map(([h, n]) => (
            <Link key={h} href={h}>
              <button className={path === h ? "on" : ""}>{n}</button>
            </Link>
          ))}
        </nav>
        <div className="me">
          <Avatar u={user} />
          <span>{user.username}</span>
          <button className="btn" onClick={logout}>Keluar</button>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
