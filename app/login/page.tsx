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

  useEffect(() => {
    if (ready && user) r.replace("/tabungan");
  }, [ready, user, r]);

  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const email = fd.get("email");
    const password = fd.get("password");
    setBusy(true);
    try {
      if (mode === "register") {
        await api("/api/register", {
          method: "POST",
          body: {
            username: fd.get("username"),
            email,
            password,
            role: fd.get("role"),
          },
        });
        toast("Akun berhasil didaftarkan");
      }
      await login(
        await api("/api/login", {
          method: "POST",
          body: { email, password },
        })
      );
    } catch (e: any) {
      toast(e.message, true);
    }
    setBusy(false);
  }

  const isLogin = mode === "login";

  return (
    <div className="auth">
      <div className="auth-header">
        <div className="brand" style={{ fontSize: "32px", fontWeight: 700 }}>
          Celengan
        </div>
        <p className="mut sm" style={{ margin: "6px 0 0" }}>
          Kelola tabungan & wujudkan target finansial Anda.
        </p>
      </div>

      <div className="card">
        <div className="tabs">
          <button
            type="button"
            className={isLogin ? "on" : ""}
            onClick={() => setMode("login")}
          >
            Masuk
          </button>
          <button
            type="button"
            className={!isLogin ? "on" : ""}
            onClick={() => setMode("register")}
          >
            Daftar Akun
          </button>
        </div>

        <form onSubmit={submit} key={mode}>
          {!isLogin && (
            <>
              <label>Username</label>
              <input
                name="username"
                placeholder="Nama pengguna"
                required
                autoComplete="username"
              />
            </>
          )}

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="nama@email.com"
            required
            autoComplete="email"
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
          />

          {/* {!isLogin && (
            <>
              <label>Daftar Sebagai</label>
              <select name="role" defaultValue="user">
                <option value="user">Pengguna (User)</option>
                <option value="admin">Administrator</option>
              </select>
            </>
          )} */}

          <div className="row" style={{ marginTop: "22px" }}>
            <button
              className="btn pri"
              type="submit"
              style={{ width: "100%", padding: "11px" }}
              disabled={busy}
            >
              {busy
                ? "Memproses…"
                : isLogin
                ? "Masuk ke Akun"
                : "Buat Akun Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
