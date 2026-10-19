// Sesuaikan di sini kalau nama field di backend berbeda
export const CFG = { txTab: "nabung_id", txType: "type", txAmount: "amount", deposit: "deposit", withdraw: "withdraw" };

export async function api<T = any>(path: string, o: { method?: string; body?: unknown; form?: FormData } = {}): Promise<T> {
  const h: Record<string, string> = {};
  const t = localStorage.getItem("token");
  if (t) h.Authorization = "Bearer " + t;
  let body: BodyInit | undefined = o.form;
  if (o.body) { h["Content-Type"] = "application/json"; body = JSON.stringify(o.body); }
  let r: Response;
  try { r = await fetch(path, { method: o.method || "GET", headers: h, body }); }
  catch { throw new Error("Tidak bisa terhubung ke server."); }
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && t) { localStorage.removeItem("token"); localStorage.removeItem("user"); location.href = "/login"; }
  if (!r.ok) throw new Error(d.message || d.error || `Terjadi kesalahan (${r.status})`);
  return d;
}

export function toast(m: string, err = false) {
  let c = document.getElementById("toast");
  if (!c) { c = document.createElement("div"); c.id = "toast"; document.body.append(c); }
  const t = document.createElement("div");
  t.textContent = m; if (err) t.className = "err";
  c.append(t); setTimeout(() => t.remove(), 3500);
}

export const arr = (d: any): any[] => (Array.isArray(d) ? d : (d && (Object.values(d).find(Array.isArray) as any[])) || []);
export const rp = (n: any) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n) || 0);
export const bal = (t: any) => Number(t.saldo ?? t.balance ?? t.current_amount ?? t.total ?? t.jumlah ?? 0);
export const tgt = (t: any) => Number(t.target_nabung ?? t.target ?? 0);
export const pct = (t: any) => (t.persentase != null ? Math.min(100, Math.round(Number(t.persentase) || 0)) : tgt(t) > 0 ? Math.min(100, Math.round((bal(t) / tgt(t)) * 100)) : 0);
export const txIn = (x: any) => /dep|setor|masuk/.test(String(x.type ?? x.tipe ?? x.jenis ?? "").toLowerCase());
export const txAmt = (x: any) => Number(x.amount ?? x.jumlah ?? x.nominal ?? 0);
export const txTabId = (x: any) => x.tabungan_id ?? x.nabung_id ?? x.id_tabungan;
export const txDate = (x: any) => {
  const d = new Date(x.created_at ?? x.date ?? x.tanggal);
  return isNaN(d.getTime()) ? "-" : d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
};
