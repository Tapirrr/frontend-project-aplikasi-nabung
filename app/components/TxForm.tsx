"use client";
import { useEffect, useState } from "react";
import { api, arr, bal, CFG, rp, toast, txAmt, txDate, txIn } from "@/lib/api";
import { Bar } from "./ui";

export default function TxForm({ id, list, done, close }: { id?: any; list: any[]; done: () => void; close: () => void }) {
  const [sel, setSel] = useState(String(id ?? list[0]?.id ?? ""));
  const [t, setT] = useState<any>(null);
  const [hist, setHist] = useState<any[]>([]);

  useEffect(() => {
    if (!sel) return;
    let ok = true;
    (async () => {
      let d = list.find((x) => String(x.id) === sel);
      try { const r = await api("/api/nabung/" + sel); d = r.tabungan || r.data || (r.id ? r : d); } catch {}
      let h: any[] = [];
      try { h = arr(await api("/api/transaksi/nabung/" + sel)).slice(0, 5); } catch {}
      if (ok) { setT(d); setHist(h); }
    })();
    return () => { ok = false; };
  }, [sel, list]);

  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    try {
      await api("/api/transaksi", { method: "POST", body: { [CFG.txTab]: Number(sel), [CFG.txType]: fd.get("type"), [CFG.txAmount]: Number(fd.get("amount")) } });
      toast("Transaksi tersimpan"); done();
    } catch (e: any) { toast(e.message, true); }
  }

  return (
    <form className="pad" onSubmit={submit}>
      <h3>{t ? t.name : "Transaksi baru"}</h3>
      {t && <><div className="amt">{rp(bal(t))}</div><Bar t={t} /></>}
      <label>Tabungan</label>
      <select value={sel} onChange={(e) => setSel(e.target.value)} required>
        {list.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
      </select>
      <label>Jenis</label>
      <div className="seg">
        <label><input type="radio" name="type" value={CFG.deposit} defaultChecked />Setor</label>
        <label><input type="radio" name="type" value={CFG.withdraw} />Tarik</label>
      </div>
      <label>Jumlah (Rp)</label>
      <input type="number" name="amount" min={1} required />
      {hist.length > 0 && (
        <>
          <p className="sm mut" style={{ margin: "16px 0 4px" }}>Terakhir</p>
          {hist.map((x, i) => (
            <div className="ct sm" key={x.id ?? i}>
              <span>{txDate(x)}</span>
              <b style={{ color: `var(--${txIn(x) ? "ok" : "bad"})` }}>{txIn(x) ? "+" : "-"}{rp(txAmt(x))}</b>
            </div>
          ))}
        </>
      )}
      <div className="row end">
        <button className="btn" type="button" onClick={close}>Tutup</button>
        <button className="btn pri" type="submit">Simpan transaksi</button>
      </div>
    </form>
  );
}
