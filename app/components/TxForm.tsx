"use client";
import { useEffect, useState } from "react";
import { api, arr, bal, CFG, rp, toast, txAmt, txDate, txIn, txTabId } from "@/lib/api";
import { Bar } from "./ui";
import { CloseIcon, ArrowDownLeftIcon, ArrowUpRightIcon } from "./Icons";

export default function TxForm({
  id,
  list,
  done,
  close,
}: {
  id?: any;
  list: any[];
  done: () => void;
  close: () => void;
}) {
  const [sel, setSel] = useState(String(id ?? list[0]?.id ?? ""));
  const [t, setT] = useState<any>(null);
  const [hist, setHist] = useState<any[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!sel) return;
    let ok = true;
    (async () => {
      let d = list.find((x) => String(x.id) === sel);
      try {
        const r = await api("/api/nabung/" + sel);
        d = r.tabungan || r.data || (r.id ? r : d);
      } catch {}

      let h: any[] = [];
      try {
        const txRes = await api("/api/transaksi");
        const allTx = arr(txRes);
        h = allTx
          .filter((x) => String(txTabId(x)) === String(sel))
          .slice(0, 4);
      } catch {}

      if (ok) {
        setT(d);
        setHist(h);
      }
    })();
    return () => {
      ok = false;
    };
  }, [sel, list]);

  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const nominal = Number(amount || fd.get("amount"));
    const typeVal = String(fd.get("type") || CFG.deposit);
    const catatanVal = String(fd.get("catatan") || "");

    if (!nominal || nominal <= 0) {
      return toast("Nominal transaksi harus lebih dari 0", true);
    }

    if (typeVal === CFG.withdraw && t && nominal > bal(t)) {
      return toast(`Saldo tidak cukup! Saldo saat ini: ${rp(bal(t))}`, true);
    }

    setBusy(true);
    try {
      // Backend newTransaksi membutuhkan nabung_id, type, dan jumlah
      await api("/api/transaksi", {
        method: "POST",
        body: {
          nabung_id: Number(sel),
          type: typeVal,
          jumlah: nominal,
          amount: nominal,
          catatan: catatanVal || null,
        },
      });
      toast(`Transaksi ${typeVal === "deposit" ? "setoran" : "penarikan"} berhasil!`);
      done();
    } catch (e: any) {
      toast(e.message, true);
    }
    setBusy(false);
  }

  const presets = [50000, 100000, 200000, 500000];

  return (
    <form className="pad" onSubmit={submit}>
      <div className="modal-header">
        <div>
          <h3>Catat Transaksi</h3>
          <p className="xs mut" style={{ margin: "2px 0 0" }}>
            {t ? t.name : "Pilih tabungan untuk mencatat"}
          </p>
        </div>
        <button type="button" className="modal-close" onClick={close} title="Tutup">
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>

      {t && (
        <div style={{ background: "#F8FAFC", border: "1px solid var(--line)", borderRadius: "12px", padding: "14px 16px", margin: "14px 0" }}>
          <div className="xs mut">Saldo saat ini</div>
          <div className="amt" style={{ fontSize: "22px", margin: "4px 0 0" }}>
            {rp(bal(t))}
          </div>
          <Bar t={t} />
        </div>
      )}

      <label>Pilih Tabungan</label>
      <select value={sel} onChange={(e) => setSel(e.target.value)} required>
        {list.map((x) => (
          <option key={x.id} value={x.id}>
            {x.name}
          </option>
        ))}
      </select>

      <label>Jenis Transaksi</label>
      <div className="seg">
        <label>
          <input type="radio" name="type" value={CFG.deposit} defaultChecked />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <ArrowDownLeftIcon className="w-3.5 h-3.5" />
            Setor (Nabung)
          </span>
        </label>
        <label>
          <input type="radio" name="type" value={CFG.withdraw} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <ArrowUpRightIcon className="w-3.5 h-3.5" />
            Tarik (Ambil)
          </span>
        </label>
      </div>

      <label>Nominal (Rp)</label>
      <input
        type="number"
        name="amount"
        min={1}
        placeholder="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
        {presets.map((val) => (
          <button
            key={val}
            type="button"
            className="btn sm"
            style={{ padding: "4px 10px", fontSize: "12px" }}
            onClick={() => setAmount(String(val))}
          >
            +{val.toLocaleString("id-ID")}
          </button>
        ))}
      </div>

      <label>Catatan (Opsional)</label>
      <input
        name="catatan"
        placeholder="Contoh: Uang saku, sisa belanja, dll."
      />

      {hist.length > 0 && (
        <div style={{ marginTop: "16px", borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
          <p className="xs mut" style={{ margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Riwayat Terakhir Tabungan Ini
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {hist.map((x, i) => (
              <div
                className="ct xs"
                key={x.id ?? i}
                style={{
                  background: "#F8FAFC",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid var(--line-light)",
                }}
              >
                <span className="mut">{txDate(x)}</span>
                <b style={{ color: `var(--${txIn(x) ? "ok" : "bad"})` }}>
                  {txIn(x) ? "+" : "-"}
                  {rp(txAmt(x))}
                </b>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="row end" style={{ marginTop: "20px" }}>
        <button className="btn" type="button" onClick={close}>
          Batal
        </button>
        <button className="btn pri" type="submit" disabled={busy}>
          {busy ? "Menyimpan…" : "Simpan Transaksi"}
        </button>
      </div>
    </form>
  );
}
