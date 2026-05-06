"use client";

import { useEffect, useState } from "react";

import { DebtRecordInput } from "@/lib/types";

type DailyEntryFormProps = {
  suggestedBalance: number;
  onSave: (record: DebtRecordInput) => { message: string; nextBalance: number };
};

type FormState = {
  date: string;
  income: string;
  expense: string;
  repayment_amount: string;
  memo: string;
};

const today = new Date().toISOString().slice(0, 10);

export function DailyEntryForm({ suggestedBalance, onSave }: DailyEntryFormProps) {
  const [form, setForm] = useState<FormState>({
    date: today,
    income: "0",
    expense: "0",
    repayment_amount: "",
    memo: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [nextBalance, setNextBalance] = useState(suggestedBalance);

  useEffect(() => {
    setNextBalance(suggestedBalance);
  }, [suggestedBalance]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const payload: DebtRecordInput = {
      date: form.date,
      income: Number(form.income),
      expense: Number(form.expense),
      repayment_amount: Number(form.repayment_amount),
      memo: form.memo
    };

    if (!payload.date) {
      setError("日付を入れてください。");
      setSaving(false);
      return;
    }

    if ([payload.income, payload.expense, payload.repayment_amount].some((value) => Number.isNaN(value) || value < 0)) {
      setError("収入・支出・返済額は0以上の数字で入力してください。");
      setSaving(false);
      return;
    }

    const result = onSave(payload);
    setMessage(result.message);
    setNextBalance(result.nextBalance);
    setForm({
      date: form.date,
      income: "0",
      expense: "0",
      repayment_amount: "",
      memo: ""
    });
    setSaving(false);
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2 className="panel__title">今日の入力</h2>
          <p className="panel__description">1日1回、必要な数字だけ入れれば大丈夫です。</p>
        </div>
        <div className="mini-note">
          入力後の残高目安
          <strong>¥{nextBalance.toLocaleString("ja-JP")}</strong>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="date">日付</label>
          <input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div className="field">
          <label htmlFor="repayment_amount">返済額</label>
          <input
            id="repayment_amount"
            type="number"
            min="0"
            inputMode="numeric"
            value={form.repayment_amount}
            onChange={(e) => setForm({ ...form, repayment_amount: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="income">収入</label>
          <input
            id="income"
            type="number"
            min="0"
            inputMode="numeric"
            value={form.income}
            onChange={(e) => setForm({ ...form, income: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="expense">支出</label>
          <input
            id="expense"
            type="number"
            min="0"
            inputMode="numeric"
            value={form.expense}
            onChange={(e) => setForm({ ...form, expense: e.target.value })}
            required
          />
        </div>
        <div className="field field--full">
          <label htmlFor="memo">メモ</label>
          <textarea
            id="memo"
            placeholder="例: コンビニを我慢できた、病院代がかかった など"
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
          />
        </div>
        <div className="field field--full field--actions">
          <button className="button" type="submit" disabled={saving}>
            {saving ? "保存中..." : "今日の記録を保存"}
          </button>
          <span className="hint">このブラウザだけに保存されます。</span>
        </div>
      </form>

      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="success">{message}</p> : null}
    </section>
  );
}
