"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, toast } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const { login, user, ready } = useAuth();
  const r = useRouter();
  useEffect(() => { if (ready && user) r.replace("/tabungan"); }, [ready, user, r]);

  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const email = fd.get("email"), password = fd.get("password");
    setBusy(true);
    try {
      if (mode === "register") {
        await api("/api/register", { method: "POST", body: { username: fd.get("username"), email, password, role: fd.get("role") } });
        toast("Akun dibuat");
      }
      await login(await api("/api/login", { method: "POST", body: { email, password } }));
    } catch (e: any) { toast(e.message, true); }
    setBusy(false);
  }

  const l = mode === "login";
  return (
    <div className="auth">
      <div className="brand" style={{ fontSize: 34 }}>Celengan</div>
      <p className="mut">Catat tabungan dan capai targetmu.</p>
      <div className="card">
        <div className="tabs">
          <button className={l ? "on" : ""} onClick={() => setMode("login")}>Masuk</button>
          <button className={l ? "" : "on"} onClick={() => setMode("register")}>Daftar</button>
        </div>
        <form onSubmit={submit} key={mode}>
          {!l && <><label>Username</label><input name="username" required /></>}
          <label>Email</label><input type="email" name="email" required />
          <label>Password</label><input type="password" name="password"  />
          {!l && <><label>Daftar sebagai</label><select name="role" defaultValue="user"><option value="user">User</option><option value="admin">Admin</option></select></>}
          <div className="row"><button className="btn pri" type="submit" style={{ flex: 1 }} disabled={busy}>{l ? "Masuk" : "Buat akun"}</button></div>
        </form>
      </div>
    </div>
  );
}
