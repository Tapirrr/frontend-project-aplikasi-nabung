"use client";
import { useCallback, useEffect, useState } from "react";
import { api, arr, rp, toast, txAmt, txDate, txIn, txTabId } from "@/lib/api";
import Dialog from "@/app/components/Dialog";
import TxForm from "@/app/components/TxForm";

export default function Transaksi() {
  const [tx, setTx] = useState<any[]>([]);
  const [tab, setTab] = useState<any[]>([]);
  const [f, setF] = useState("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([api("/api/transaksi"), api("/api/nabung").catch(() => [])]);
      setTx(arr(a)); setTab(arr(b));
    } catch (e: any) { toast(e.message, true); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const name = (x: any) => tab.find((t) => String(t.id) === String(txTabId(x)))?.name || x.tabungan_name || x.name || "#" + txTabId(x);
  const rows = tx.filter((x) => f === "all" || (f === "in") === txIn(x));

  if (loading) return <div className="empty">Memuat…</div>;
  return (
    <>
      <div className="head"><h1>Riwayat transaksi</h1><button className="btn pri" onClick={() => setOpen(true)}>Transaksi baru</button></div>
      <div className="chips">
        {[["all", "Semua"], ["in", "Setoran"], ["out", "Penarikan"]].map(([k, n]) => <button key={k} className={f === k ? "on" : ""} onClick={() => setF(k)}>{n}</button>)}
      </div>
      {rows.length ? (
        <div className="tw">
          <table>
            <thead><tr><th>Tanggal</th><th>Tabungan</th><th>Jenis</th><th>Jumlah</th></tr></thead>
            <tbody>
              {rows.map((x, i) => (
                <tr key={x.id ?? i}>
                  <td>{txDate(x)}</td><td>{name(x)}</td>
                  <td><span className={`pill ${txIn(x) ? "in" : "out"}`}>{txIn(x) ? "Setoran" : "Penarikan"}</span></td>
                  <td style={{ color: `var(--${txIn(x) ? "ok" : "bad"})` }}>{txIn(x) ? "+" : "-"}{rp(txAmt(x))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty">Belum ada transaksi yang cocok.</div>}
      <Dialog open={open} onClose={() => setOpen(false)}>
        {open && <TxForm list={tab} done={() => { setOpen(false); load(); }} close={() => setOpen(false)} />}
      </Dialog>
    </>
  );
}
