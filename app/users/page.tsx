"use client";
import { useCallback, useEffect, useState } from "react";
import { api, arr, toast } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/app/components/ui";

export default function Users() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const isAdmin = user.role === "admin";

  const load = useCallback(async () => {
    try { setList(arr(await api("/api/users"))); } catch (e: any) { toast(e.message, true); }
  }, []);
  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  async function del(id: any) {
    if (!confirm("Hapus pengguna ini?")) return;
    try { await api("/api/users/" + id, { method: "DELETE" }); toast("Pengguna dihapus"); load(); }
    catch (e: any) { toast(e.message, true); }
  }

  if (!isAdmin) return <div className="empty">Halaman ini hanya untuk admin.</div>;
  return (
    <>
      <div className="head"><h1>Pengguna</h1></div>
      {list.length ? (
        <div className="tw">
          <table>
            <thead><tr><th></th><th>Username</th><th>Email</th><th>Peran</th><th></th></tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td><Avatar u={u} /></td><td>{u.username}</td><td>{u.email}</td><td>{u.role || "user"}</td>
                  <td>{String(u.id) !== String(user.id) && <button className="btn danger" onClick={() => del(u.id)}>Hapus</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty">Belum ada pengguna.</div>}
    </>
  );
}
