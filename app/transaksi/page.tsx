"use client";
import { useCallback, useEffect, useState } from "react";
import { api, arr, rp, toast, txAmt, txDate, txIn, txTabId } from "@/lib/api";
import Dialog from "@/app/components/Dialog";
import TxForm from "@/app/components/TxForm";
import {
  PlusIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  WalletIcon,
} from "@/app/components/Icons";

export default function Transaksi() {
  const [tx, setTx] = useState<any[]>([]);
  const [tab, setTab] = useState<any[]>([]);
  const [f, setF] = useState("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([
        api("/api/transaksi"),
        api("/api/nabung").catch(() => []),
      ]);
      setTx(arr(a));
      setTab(arr(b));
    } catch (e: any) {
      toast(e.message, true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const name = (x: any) =>
    x.nama_tabungan ||
    tab.find((t) => String(t.id) === String(txTabId(x)))?.name ||
    x.tabungan_name ||
    x.name ||
    "#" + txTabId(x);

  const rows = tx.filter((x) => f === "all" || (f === "in") === txIn(x));
  const inCount = tx.filter((x) => txIn(x)).length;
  const outCount = tx.filter((x) => !txIn(x)).length;

  if (loading) {
    return (
      <div className="empty">
        <div className="empty-icon">
          <WalletIcon className="w-6 h-6" />
        </div>
        <div style={{ fontWeight: 600, color: "var(--ink)" }}>Memuat riwayat transaksi…</div>
      </div>
    );
  }

  return (
    <>
      <div className="head">
        <div>
          <h1>Riwayat Transaksi</h1>
          <p className="mut sm" style={{ margin: "4px 0 0" }}>
            Semua catatan arus mutasi simpanan dan penarikan celengan Anda.
          </p>
        </div>
        <button className="btn pri" onClick={() => setOpen(true)}>
          <PlusIcon className="w-4 h-4" />
          <span>Transaksi Baru</span>
        </button>
      </div>

      <div className="chips">
        {[
          ["all", `Semua (${tx.length})`],
          ["in", `Setoran (${inCount})`],
          ["out", `Penarikan (${outCount})`],
        ].map(([k, n]) => (
          <button key={k} className={f === k ? "on" : ""} onClick={() => setF(k)}>
            {n}
          </button>
        ))}
      </div>

      {rows.length ? (
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Tabungan</th>
                <th>Tipe</th>
                <th style={{ textAlign: "right" }}>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((x, i) => {
                const isDeposit = txIn(x);
                return (
                  <tr key={x.id ?? i}>
                    <td style={{ color: "var(--mut)", fontSize: "13px" }}>
                      {txDate(x)}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--ink)" }}>
                      {name(x)}
                    </td>
                    <td>
                      <span className={`pill ${isDeposit ? "in" : "out"}`}>
                        {isDeposit ? (
                          <>
                            <ArrowDownLeftIcon className="w-3.5 h-3.5" />
                            <span>Setoran</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRightIcon className="w-3.5 h-3.5" />
                            <span>Penarikan</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        color: isDeposit ? "#059669" : "#DC2626",
                      }}
                    >
                      {isDeposit ? "+" : "-"}
                      {rp(txAmt(x))}
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
            <WalletIcon className="w-6 h-6" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: "4px" }}>
              Tidak ada transaksi
            </div>
            <p className="xs mut" style={{ margin: 0 }}>
              Belum ada data mutasi yang sesuai dengan filter yang dipilih.
            </p>
          </div>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        {open && (
          <TxForm
            list={tab}
            done={() => {
              setOpen(false);
              load();
            }}
            close={() => setOpen(false)}
          />
        )}
      </Dialog>
    </>
  );
}
