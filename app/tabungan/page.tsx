"use client";
import { useCallback, useEffect, useState } from "react";
import { api, arr, bal, tgt, pct, rp, toast } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Dialog from "@/app/components/Dialog";
import TxForm from "@/app/components/TxForm";
import { Bar } from "@/app/components/ui";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  CloseIcon,
  WalletIcon,
  TargetIcon,
  LayersIcon,
} from "@/app/components/Icons";

function TabForm({
  t,
  done,
  close,
}: {
  t: any;
  done: () => void;
  close: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    setBusy(true);
    try {
      await api(t ? "/api/nabung/" + t.id : "/api/nabung", {
        method: t ? "PUT" : "POST",
        body: {
          name: String(fd.get("name")).trim(),
          target_nabung: Number(fd.get("target")),
        },
      });
      toast(t ? "Perubahan disimpan" : "Tabungan baru berhasil dibuat");
      done();
    } catch (e: any) {
      toast(e.message, true);
    }
    setBusy(false);
  }

  return (
    <form className="pad" onSubmit={submit}>
      <div className="modal-header">
        <div>
          <h3>{t ? "Edit Tabungan" : "Buat Tabungan Baru"}</h3>
          <p className="xs mut" style={{ margin: "2px 0 0" }}>
            Tentukan tujuan dan target dana yang ingin dicapai
          </p>
        </div>
        <button type="button" className="modal-close" onClick={close} title="Tutup">
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>

      <label>Nama Tabungan</label>
      <input
        name="name"
        defaultValue={t?.name}
        placeholder="Contoh: Beli Laptop Baru, Liburan Bali"
        required
      />

      <label>Target Nominal (Rp)</label>
      <input
        type="number"
        name="target"
        min={1}
        placeholder="Contoh: 5000000"
        defaultValue={t?.target_nabung ?? t?.target}
        required
      />

      <div className="row end" style={{ marginTop: "24px" }}>
        <button className="btn" type="button" onClick={close}>
          Batal
        </button>
        <button className="btn pri" type="submit" disabled={busy}>
          {busy ? "Menyimpan…" : "Simpan Tabungan"}
        </button>
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
    try {
      setList(arr(await api("/api/nabung")));
    } catch (e: any) {
      toast(e.message, true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function del(id: any) {
    if (!confirm("Hapus tabungan ini beserta seluruh riwayat transaksinya?")) return;
    try {
      await api("/api/nabung/" + id, { method: "DELETE" });
      toast("Tabungan berhasil dihapus");
      load();
    } catch (e: any) {
      toast(e.message, true);
    }
  }

  const after = () => {
    setForm(null);
    setTx(null);
    load();
  };

  const totalBalance = list.reduce((a, t) => a + bal(t), 0);
  const totalTarget = list.reduce((a, t) => a + tgt(t), 0);
  const avgProgress =
    totalTarget > 0 ? Math.min(100, Math.round((totalBalance / totalTarget) * 100)) : 0;

  if (loading) {
    return (
      <div className="empty">
        <div className="empty-icon">
          <WalletIcon className="w-6 h-6" />
        </div>
        <div style={{ fontWeight: 600, color: "var(--ink)" }}>Memuat data tabungan…</div>
      </div>
    );
  }

  return (
    <>
      <div className="head">
        <div>
          <h1>Dashboard Tabungan</h1>
          <p className="mut sm" style={{ margin: "4px 0 0" }}>
            Kelola tujuan menabung Anda dengan efisien dan terarah.
          </p>
        </div>
        <button className="btn pri" onClick={() => setForm("new")}>
          <PlusIcon className="w-4 h-4" />
          <span>Tabungan Baru</span>
        </button>
      </div>

      {list.length > 0 && (
        <div className="stats-banner">
          <div className="stat-box">
            <div className="stat-label">
              <WalletIcon className="w-4 h-4" />
              <span>Total Saldo Terkumpul</span>
            </div>
            <div className="stat-value">{rp(totalBalance)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">
              <TargetIcon className="w-4 h-4" />
              <span>Total Target Keseluruhan</span>
            </div>
            <div className="stat-value">{rp(totalTarget)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">
              <LayersIcon className="w-4 h-4" />
              <span>Pencapaian Rata-rata</span>
            </div>
            <div className="stat-value">
              {avgProgress}% <span className="xs mut" style={{ fontWeight: 400 }}>({list.length} celengan)</span>
            </div>
          </div>
        </div>
      )}

      {list.length ? (
        <div className="grid">
          {list.map((t) => (
            <article className="card" key={t.id}>
              <div className="ct">
                <h3>{t.name}</h3>
                {user.role === "admin" && t.username && (
                  <span className="pill admin">{t.username}</span>
                )}
              </div>
              <div className="amt">{rp(bal(t))}</div>
              <Bar t={t} />
              <div className="row" style={{ marginTop: "auto", paddingTop: "14px" }}>
                <button
                  className="btn pri sm"
                  style={{ flex: 1 }}
                  onClick={() => setTx({ id: t.id })}
                >
                  Setor / Tarik
                </button>
                <button
                  className="btn sm"
                  onClick={() => setForm(t)}
                  title="Edit Tabungan"
                >
                  <EditIcon className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  className="btn danger sm"
                  onClick={() => del(t.id)}
                  title="Hapus Tabungan"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">
            <TargetIcon className="w-6 h-6" />
          </div>
          <div style={{ maxWidth: "340px" }}>
            <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: "16px", marginBottom: "4px" }}>
              Belum ada tabungan
            </div>
            <p className="xs mut" style={{ margin: "0 0 16px" }}>
              Mulai kebiasaan baik menabung dengan membuat target tabungan impian pertama Anda.
            </p>
            <button className="btn pri" onClick={() => setForm("new")}>
              <PlusIcon className="w-4 h-4" />
              <span>Buat Tabungan Pertama</span>
            </button>
          </div>
        </div>
      )}

      <Dialog open={!!form} onClose={() => setForm(null)}>
        {form && (
          <TabForm
            t={form === "new" ? null : form}
            done={after}
            close={() => setForm(null)}
          />
        )}
      </Dialog>

      <Dialog open={!!tx} onClose={() => setTx(null)}>
        {tx && (
          <TxForm
            id={tx.id}
            list={list}
            done={after}
            close={() => setTx(null)}
          />
        )}
      </Dialog>
    </>
  );
}
