"use client";
import { useCallback, useEffect, useState } from "react";
import { api, arr, bal, rp, toast } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Dialog from "@/app/components/Dialog";
import TxForm from "@/app/components/TxForm";
import { Bar } from "@/app/components/ui";

function TabForm({ t, done, close }: { t: any; done: () => void; close: () => void }) {
  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    try {
      await api(t ? "/api/nabung/" + t.id : "/api/nabung", { method: t ? "PUT" : "POST", body: { name: String(fd.get("name")).trim(), target_nabung: Number(fd.get("target")) } });
      toast(t ? "Perubahan disimpan" : "Tabungan dibuat"); done();
    } catch (e: any) { toast(e.message, true); }
  }
  return (
    <form className="pad" onSubmit={submit}>
      <h3>{t ? "Edit tabungan" : "Tabungan baru"}</h3>
      <label>Nama tabungan</label>
      <input name="name" defaultValue={t?.name} placeholder="Contoh: Liburan Bali" required />
      <label>Target (Rp)</label>
      <input type="number" name="target" min={1} defaultValue={t?.target_nabung ?? t?.target} required />
      <div className="row end">
        <button className="btn" type="button" onClick={close}>Batal</button>
        <button className="btn pri" type="submit">Simpan</button>
      </div>
    </form>
  );
}

export default function Tabungan() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null); // "new" | objek tabungan | null
  const [tx, setTx] = useState<any>(null); // { id } | null

  const load = useCallback(async () => {
    try { setList(arr(await api("/api/nabung"))); } catch (e: any) { toast(e.message, true); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function del(id: any) {
    if (!confirm("Hapus tabungan ini beserta riwayatnya?")) return;
    try { await api("/api/nabung/" + id, { method: "DELETE" }); toast("Tabungan dihapus"); load(); }
    catch (e: any) { toast(e.message, true); }
  }
  const after = () => { setForm(null); setTx(null); load(); };

  if (loading) return <div className="empty">Memuat…</div>;
  return (
    <>
      <div className="head">
        <div>
          <h1>Tabungan</h1>
          <p className="mut" style={{ margin: "4px 0 0" }}>Total tersimpan <b>{rp(list.reduce((a, t) => a + bal(t), 0))}</b></p>
        </div>
        <button className="btn pri" onClick={() => setForm("new")}>Tabungan baru</button>
      </div>
      {list.length ? (
        <div className="grid">
          {list.map((t) => (
            <article className="card" key={t.id}>
              <div className="ct"><h3>{t.name}</h3>{user.role === "admin" && t.username && <span className="pill">{t.username}</span>}</div>
              <div className="amt">{rp(bal(t))}</div>
              <Bar t={t} />
              <div className="row">
                <button className="btn pri" onClick={() => setTx({ id: t.id })}>Setor / Tarik</button>
                <button className="btn" onClick={() => setForm(t)}>Edit</button>
                <button className="btn danger" onClick={() => del(t.id)}>Hapus</button>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="empty">Belum ada tabungan. Buat tabungan pertama dan tentukan targetnya.</div>}
      <Dialog open={!!form} onClose={() => setForm(null)}>{form && <TabForm t={form === "new" ? null : form} done={after} close={() => setForm(null)} />}</Dialog>
      <Dialog open={!!tx} onClose={() => setTx(null)}>{tx && <TxForm id={tx.id} list={list} done={after} close={() => setTx(null)} />}</Dialog>
    </>
  );
}
