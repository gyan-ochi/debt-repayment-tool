"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getEstimatedMonthlyInterest } from "@/lib/debt-utils";
import { formatCurrency, formatPercent } from "@/lib/format";
import { DebtBreakdownSummary, DebtItem } from "@/lib/types";

type DebtBreakdownManagerProps = {
  items: DebtItem[];
  summary: DebtBreakdownSummary;
};

type FormState = {
  lender_name: string;
  balance: string;
  annual_interest_rate: string;
  minimum_payment: string;
};

const emptyForm: FormState = {
  lender_name: "",
  balance: "",
  annual_interest_rate: "",
  minimum_payment: ""
};

export function DebtBreakdownManager({ items, summary }: DebtBreakdownManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (editingId === null) {
      setForm(emptyForm);
      return;
    }

    const target = items.find((item) => item.id === editingId);
    if (!target) {
      setEditingId(null);
      setForm(emptyForm);
      return;
    }

    setForm({
      lender_name: target.lender_name,
      balance: String(target.balance),
      annual_interest_rate: String(target.annual_interest_rate),
      minimum_payment: String(target.minimum_payment)
    });
  }, [editingId, items]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      lender_name: form.lender_name,
      balance: Number(form.balance),
      annual_interest_rate: Number(form.annual_interest_rate),
      minimum_payment: Number(form.minimum_payment)
    };

    const url = editingId === null ? "/api/debt-items" : `/api/debt-items/${editingId}`;
    const method = editingId === null ? "POST" : "PUT";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setError(result.error ?? "保存に失敗しました。");
      setSaving(false);
      return;
    }

    setMessage(result.message ?? "保存しました。");
    resetForm();
    router.refresh();
    setSaving(false);
  }

  async function handleDelete(item: DebtItem) {
    const confirmed = window.confirm(`「${item.lender_name}」を削除しますか？`);
    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setMessage("");
    setError("");

    const response = await fetch(`/api/debt-items/${item.id}`, {
      method: "DELETE"
    });

    const result = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setError(result.error ?? "削除に失敗しました。");
      setDeletingId(null);
      return;
    }

    if (editingId === item.id) {
      resetForm();
    }

    setMessage(result.message ?? "削除しました。");
    setDeletingId(null);
    router.refresh();
  }

  return (
    <section className="overview-grid">
      <section className="panel">
        <div className="panel__header">
          <div>
            <h2 className="panel__title">借金内訳</h2>
            <p className="panel__description">金利が高い順に並びます。1画面で確認と入力が完結します。</p>
          </div>
        </div>

        {summary.topPriorityDebt ? (
          <div className="priority-card">
            <span className="priority-card__label">最優先返済</span>
            <strong>{summary.topPriorityDebt.lender_name}</strong>
            <p>
              金利 {formatPercent(summary.topPriorityDebt.annual_interest_rate)} / 残高{" "}
              {formatCurrency(summary.topPriorityDebt.balance)}
            </p>
          </div>
        ) : (
          <p className="empty-state">まだ借金内訳がありません。右側のフォームから追加してください。</p>
        )}

        {items.length > 0 ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>借入先</th>
                    <th>残高</th>
                    <th>金利</th>
                    <th>最低返済額</th>
                    <th>月利息目安</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.lender_name}</td>
                      <td>{formatCurrency(item.balance)}</td>
                      <td>{formatPercent(item.annual_interest_rate)}</td>
                      <td>{formatCurrency(item.minimum_payment)}</td>
                      <td>{formatCurrency(getEstimatedMonthlyInterest(item.balance, item.annual_interest_rate))}</td>
                      <td>
                        <div className="row-actions">
                          <button className="button button--ghost" type="button" onClick={() => setEditingId(item.id)}>
                            編集
                          </button>
                          <button
                            className="button button--danger"
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? "削除中..." : "削除"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="summary-list debt-summary-list">
              <div>
                <span>総残高</span>
                <strong>{formatCurrency(summary.totalBalance)}</strong>
              </div>
              <div>
                <span>最低返済額 合計</span>
                <strong>{formatCurrency(summary.totalMinimumPayment)}</strong>
              </div>
              <div>
                <span>総利息の簡易表示</span>
                <strong>{formatCurrency(summary.totalEstimatedMonthlyInterest)}</strong>
              </div>
            </div>
          </>
        ) : null}
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <h2 className="panel__title">{editingId === null ? "借金追加" : "借金編集"}</h2>
            <p className="panel__description">
              {editingId === null ? "借入先、残高、金利、最低返済額だけ入力すれば使えます。" : "編集したら保存を押してください。"}
            </p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="lender_name">借入先</label>
            <input
              id="lender_name"
              value={form.lender_name}
              onChange={(event) => setForm({ ...form, lender_name: event.target.value })}
              placeholder="例: カードローンA"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="balance">残高</label>
            <input
              id="balance"
              type="number"
              min="0"
              inputMode="numeric"
              value={form.balance}
              onChange={(event) => setForm({ ...form, balance: event.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="annual_interest_rate">金利</label>
            <input
              id="annual_interest_rate"
              type="number"
              min="0"
              step="0.1"
              inputMode="decimal"
              value={form.annual_interest_rate}
              onChange={(event) => setForm({ ...form, annual_interest_rate: event.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="minimum_payment">最低返済額</label>
            <input
              id="minimum_payment"
              type="number"
              min="0"
              inputMode="numeric"
              value={form.minimum_payment}
              onChange={(event) => setForm({ ...form, minimum_payment: event.target.value })}
              required
            />
          </div>
          <div className="field field--full field--actions">
            <div className="inline-actions">
              <button className="button button--secondary" type="submit" disabled={saving}>
                {saving ? "保存中..." : editingId === null ? "借金を追加" : "編集を保存"}
              </button>
              {editingId !== null ? (
                <button className="button button--ghost" type="button" onClick={resetForm}>
                  追加モードに戻す
                </button>
              ) : null}
            </div>
            <span className="hint">金利が高い順に自動で並びます。</span>
          </div>
        </form>

        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="success">{message}</p> : null}
      </section>
    </section>
  );
}
