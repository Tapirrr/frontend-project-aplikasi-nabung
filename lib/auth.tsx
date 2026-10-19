"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

type U = { id?: any; username?: string; email?: string; role?: string; [k: string]: any };
const Ctx = createContext<any>(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setU] = useState<U | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const u = localStorage.getItem("user"); if (localStorage.getItem("token") && u) setU(JSON.parse(u)); } catch {}
    setReady(true);
  }, []);
  const setUser = (u: U | null) => { setU(u); if (u) localStorage.setItem("user", JSON.stringify(u)); else localStorage.removeItem("user"); };
  const login = async (d: any) => {
    const t = d.token || d.accessToken;
    if (!t) throw new Error("Respons login tidak berisi token.");
    localStorage.setItem("token", t);
    let u = d.user || d.data;
    try { const m = await api("/api/users/me"); u = m.user || m.data || m; } catch {}
    if (!u) { try { u = JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); } catch { u = {}; } }
    setUser(u);
  };
  const logout = () => { localStorage.removeItem("token"); setUser(null); };
  return <Ctx.Provider value={{ user, ready, login, logout, setUser }}>{children}</Ctx.Provider>;
}
