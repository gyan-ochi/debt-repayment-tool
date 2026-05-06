"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { DebtSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: DebtSettings }) {
  const router = useRouter();
  const [form, setForm] = useState({
    initial_debt: String(settings.initial_debt),
    current_balance: String(settings.current_balance),
    monthly_payment: String(settings.monthly_payment),
    gambling_start_date: settings.gambling_start_date ?? ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initial_debt: Number(form.initial_debt),
        current_balance: Number(form.current_balance),
        monthly_payment: Number(form.monthly_payment),
        gambling_start_date: form.gambling_start_date || null
      })
    });

    const result = (await response.json()) as { message?: string; error?: string };
    if (!response.ok) {
      setError(result.error ?? "保存に失敗しました。");
      setSaving(false);
      return;
    }

    setMessage(result.message ?? "保存しました。");
    router.refresh();
    setSaving(false);
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2 className="panel__title">借金設定</h2>
          <p className="panel__description">最初に一度入力しておけば、毎日の記録がかなり楽になります。</p>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="initial_debt">初期借入額</label>
          <input
            id="initial_debt"
            type="number"
            min="0"
            inputMode="numeric"
            value={form.initial_debt}
            onChange={(e) => setForm({ ...form, initial_debt: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="current_balance">現在残高</label>
          <input
            id="current_balance"
            type="number"
            min="0"
            inputMode="numeric"
            value={form.current_balance}
            onChange={(e) => setForm({ ...form, current_balance: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="monthly_payment">月返済額の目安</label>
          <input
            id="monthly_payment"
            type="number"
            min="0"
            inputMode="numeric"
            value={form.monthly_payment}
            onChange={(e) => setForm({ ...form, monthly_payment: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="gambling_start_date">ギャンブル断ち開始日</label>
          <input
            id="gambling_start_date"
            type="date"
            value={form.gambling_start_date}
            onChange={(e) => setForm({ ...form, gambling_start_date: e.target.value })}
          />
        </div>
        <div className="field field--full field--actions">
          <button className="button button--secondary" type="submit" disabled={saving}>
            {saving ? "保存中..." : "借金設定を保存"}
          </button>
        </div>
      </form>

      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="success">{message}</p> : null}
    </section>
  );
}
