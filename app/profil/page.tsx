"use client";
import { useState } from "react";
import { api, toast } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/app/components/ui";

export default function Profil() {
  const { user, setUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fd = new FormData(form);

    // Jangan kirim field password jika kosong agar password lama tidak terganggu
    const password = fd.get("password") as string | null;
    if (!password || !password.trim()) {
      fd.delete("password");
    }

    // Jangan kirim image jika tidak ada file yang dipilih
    const file = fd.get("image") as File | null;
    if (!file || !file.size) {
      fd.delete("image");
    }

    setBusy(true);
    try {
      const res = await api("/api/users/profile", {
        method: "PUT",
        form: fd,
      });

      const updated = res.data || res.user || res;
      setUser({ ...user, ...updated });
      toast(res.message || "Profil berhasil diperbarui!");
      setPreview(null);

      // Kosongkan input password setelah berhasil simpan
      const pwdInput = form.querySelector('input[name="password"]') as HTMLInputElement | null;
      if (pwdInput) pwdInput.value = "";
    } catch (e: any) {
      toast(e.message, true);
    }
    setBusy(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  return (
    <>
      <div className="head">
        <div>
          <h1>Pengaturan Profil</h1>
          <p className="mut sm" style={{ margin: "4px 0 0" }}>
            Perbarui data diri, email, password, dan foto profil akun Anda.
          </p>
        </div>
      </div>

      <div className="card prof" style={{ maxWidth: "520px" }}>
        <div className="prof-av-wrap">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview"
              className="av"
              style={{
                width: "84px",
                height: "84px",
                border: "3px solid #FFFFFF",
                boxShadow: "var(--shadow-md)",
              }}
            />
          ) : (
            <Avatar u={user} className="av" />
          )}
        </div>

        <h3 style={{ fontSize: "19px", marginBottom: "4px" }}>{user.username}</h3>
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <span className="sm mut">{user.email}</span>
          <span className="pill admin" style={{ fontSize: "11px", padding: "1px 8px" }}>
            {user.role || "user"}
          </span>
        </div>

        <form
          onSubmit={submit}
          style={{
            width: "100%",
            textAlign: "left",
            borderTop: "1px solid var(--line)",
            paddingTop: "18px",
          }}
        >
          <label>Username</label>
          <input
            name="username"
            defaultValue={user.username}
            placeholder="Masukkan username baru"
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            defaultValue={user.email}
            placeholder="nama@email.com"
            required
          />

          <label>Password Baru</label>
          <input
            type="password"
            name="password"
            placeholder="Kosongkan jika tidak ingin mengubah password"
            autoComplete="new-password"
          />
          <p className="xs mut" style={{ margin: "4px 0 0" }}>
            Biarkan kosong apabila Anda tidak ingin mengganti kata sandi.
          </p>

          <label>Foto Profil</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
          />
          <p className="xs mut" style={{ margin: "4px 0 20px" }}>
            Format gambar didukung: JPG, PNG, atau WEBP (Maksimal 4MB).
          </p>

          <button
            className="btn pri"
            type="submit"
            disabled={busy}
            style={{ width: "100%", padding: "11px" }}
          >
            {busy ? "Menyimpan Perubahan…" : "Simpan Perubahan Profil"}
          </button>
        </form>
      </div>
    </>
  );
}
