"use client";
import { useState } from "react";
import { api, toast } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/app/components/ui";

export default function Profil() {
  const { user, setUser } = useAuth();
  const [busy, setBusy] = useState(false);

  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const file = new FormData(form).get("image") as File | null;
    if (!file || !file.size) return toast("Pilih foto terlebih dahulu", true);
    const fd = new FormData();
    fd.append("image", file);
    setBusy(true);
    try {
      await api("/api/users/upload-profile", { method: "POST", form: fd });
      const m = await api("/api/users/me");
      setUser({ ...user, ...(m.user || m.data || m) });
      form.reset();
      toast("Foto profil diperbarui");
    } catch (e: any) { toast(e.message, true); }
    setBusy(false);
  }

  return (
    <>
      <div className="head"><h1>Profil</h1></div>
      <form className="card prof" onSubmit={submit}>
        <Avatar u={user} />
        <p style={{ margin: "12px 0 0" }}><b>{user.username}</b></p>
        <p className="mut" style={{ margin: 0 }}>{user.email} · {user.role || "user"}</p>
        <label>Ganti foto profil</label>
        <input type="file" name="image" accept="image/*" />
        <div className="row"><button className="btn pri" type="submit" disabled={busy}>Unggah foto</button></div>
      </form>
    </>
  );
}
