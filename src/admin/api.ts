import { ACCOUNT_KEY, loadAccount, type Account } from "../store";

export class AdminError extends Error { constructor(msg: string, public status: number) { super(msg); } }

async function refreshSession(acc: Account): Promise<Account | null> {
  if (!acc.session?.refresh_token) return null;
  const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "refresh", refresh_token: acc.session.refresh_token }) }).catch(() => null);
  if (!r?.ok) return null;
  const { session } = await r.json();
  const next = { ...acc, session };
  try { localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  return next;
}

// Calls /api/admin with the saved login, refreshing it once if it has expired.
export async function admin<T = unknown>(action: string, body: Record<string, unknown> = {}): Promise<T> {
  let acc = loadAccount();
  if (!acc?.session?.access_token) throw new AdminError("Please log in.", 401);
  const call = (a: Account) => fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${a.session!.access_token}` },
    body: JSON.stringify({ action, ...body }),
  });
  if (acc.session.expires_at && acc.session.expires_at * 1000 < Date.now() + 30_000) acc = (await refreshSession(acc)) ?? acc;
  let r = await call(acc).catch(() => null);
  if (r?.status === 401) {
    const next = await refreshSession(acc);
    if (next) r = await call(next).catch(() => null);
  }
  if (!r) throw new AdminError("We couldn't reach the server. Check your connection.", 0);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new AdminError(data.error || "Something went wrong.", r.status);
  return data as T;
}

// Shrinks a photo in the browser (longest side 1600 px, JPEG) so uploads stay small and fast.
export async function shrink(file: File): Promise<{ data: string; type: string; name: string; preview: string }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const url = c.toDataURL("image/jpeg", 0.84);
  return { data: url.split(",")[1], type: "image/jpeg", name: file.name, preview: url };
}

export function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => { const s = v == null ? "" : Array.isArray(v) || typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
