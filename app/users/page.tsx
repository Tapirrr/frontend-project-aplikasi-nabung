"use client";
import { useCallback, useEffect, useState } from "react";
import { api, arr, toast } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/app/components/ui";
import { TrashIcon, LayersIcon } from "@/app/components/Icons";

export default function Users() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user.role === "admin";

  const load = useCallback(async () => {
    try {
      setList(arr(await api("/api/users")));
    } catch (e: any) {
      toast(e.message, true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  async function del(id: any) {
    if (!confirm("Hapus pengguna ini dari sistem?")) return;
    try {
      await api("/api/users/" + id, { method: "DELETE" });
      toast("Pengguna berhasil dihapus");
      load();
    } catch (e: any) {
      toast(e.message, true);
    }
  }

  if (!isAdmin) {
    return (
      <div className="empty">
        <div style={{ fontWeight: 600, color: "var(--ink)" }}>Akses Ditolak</div>
        <p className="sm mut">Halaman ini hanya dapat diakses oleh administrator.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="empty">
        <div style={{ fontWeight: 600, color: "var(--ink)" }}>Memuat data pengguna…</div>
      </div>
    );
  }

  return (
    <>
      <div className="head">
        <div>
          <h1>Manajemen Pengguna</h1>
          <p className="mut sm" style={{ margin: "4px 0 0" }}>
            Daftar seluruh pengguna terdaftar dalam sistem Celengan.
          </p>
        </div>
      </div>

      {list.length ? (
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th style={{ width: "48px" }}></th>
                <th>Pengguna</th>
                <th>Email</th>
                <th>Peran</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => {
                const isSelf = String(u.id) === String(user.id);
                const isUserAdmin = u.role === "admin";
                return (
                  <tr key={u.id}>
                    <td>
                      <Avatar u={u} />
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--ink)" }}>
                      {u.username}
                      {isSelf && (
                        <span className="pill xs" style={{ marginLeft: "8px" }}>
                          Anda
                        </span>
                      )}
                    </td>
                    <td style={{ color: "var(--mut)" }}>{u.email}</td>
                    <td>
                      <span className={`pill ${isUserAdmin ? "admin" : ""}`}>
                        {u.role || "user"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {!isSelf && (
                        <button
                          className="btn danger sm"
                          onClick={() => del(u.id)}
                          title="Hapus Pengguna"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">
            <LayersIcon className="w-6 h-6" />
          </div>
          <div>Belum ada data pengguna lainnya.</div>
        </div>
      )}
    </>
  );
}
