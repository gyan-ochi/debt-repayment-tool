"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Charts } from "@/components/charts";
import { DailyEntryForm } from "@/components/daily-entry-form";
import { DebtBreakdownManager } from "@/components/debt-breakdown-manager";
import { MetricCard } from "@/components/metric-card";
import { RecordsTable } from "@/components/records-table";
import { SettingsForm } from "@/components/settings-form";
import { defaultSettings, getChartData, getDashboardSummary, getDebtBreakdownSummary } from "@/lib/dashboard";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  clearAllStoredData,
  loadDebtItems,
  loadRecords,
  loadSettings,
  saveDebtItems,
  saveRecords,
  saveSettings
} from "@/lib/local-storage";
import { DebtItem, DebtItemInput, DebtRecord, DebtRecordInput, DebtSettings, DebtSettingsInput } from "@/lib/types";

const tabs = [
  { key: "dashboard", label: "ダッシュボード" },
  { key: "input", label: "入力" },
  { key: "debts", label: "借金内訳" },
  { key: "graphs", label: "グラフ" }
] as const;

type TabKey = (typeof tabs)[number]["key"];

function sortDebtItems(items: DebtItem[]) {
  return [...items].sort((a, b) => {
    if (b.annual_interest_rate !== a.annual_interest_rate) {
      return b.annual_interest_rate - a.annual_interest_rate;
    }

    if (b.balance !== a.balance) {
      return b.balance - a.balance;
    }

    return a.id - b.id;
  });
}

export function AppClient({ initialTab }: { initialTab: TabKey }) {
  const [hydrated, setHydrated] = useState(false);
  const [records, setRecords] = useState<DebtRecord[]>([]);
  const [settings, setSettingsState] = useState<DebtSettings>(defaultSettings);
  const [debtItems, setDebtItems] = useState<DebtItem[]>([]);
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    const nextSettings = loadSettings(defaultSettings);
    const nextRecords = loadRecords();
    const nextDebtItems = sortDebtItems(loadDebtItems());

    setSettingsState(nextSettings);
    setRecords(nextRecords);
    setDebtItems(nextDebtItems);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveSettings(settings);
  }, [hydrated, settings]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveRecords(records);
  }, [hydrated, records]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveDebtItems(debtItems);
  }, [hydrated, debtItems]);

  const summary = useMemo(() => getDashboardSummary(settings, records), [settings, records]);
  const chartData = useMemo(() => getChartData(settings, records), [settings, records]);
  const debtBreakdown = useMemo(() => getDebtBreakdownSummary(debtItems), [debtItems]);

  function handleSaveRecord(input: DebtRecordInput) {
    setResetMessage("");

    const existingRecord = records.find((record) => record.date === input.date);
    const previousRepayment = existingRecord?.repayment_amount ?? 0;
    const nextBalance = Math.max(settings.current_balance + previousRepayment - input.repayment_amount, 0);

    const nextRecord: DebtRecord = {
      id: existingRecord?.id ?? Date.now(),
      created_at: existingRecord?.created_at ?? new Date().toISOString(),
      ...input
    };

    const nextRecords = [nextRecord, ...records.filter((record) => record.date !== input.date)].sort((a, b) =>
      a.date < b.date ? 1 : -1
    );

    setRecords(nextRecords);
    setSettingsState((current) => ({
      ...current,
      current_balance: nextBalance,
      updated_at: new Date().toISOString()
    }));

    return {
      message: "記録を保存しました。",
      nextBalance
    };
  }

  function handleSaveSettings(input: DebtSettingsInput) {
    setResetMessage("");

    setSettingsState({
      id: 1,
      updated_at: new Date().toISOString(),
      ...input
    });

    return "借金設定を保存しました。";
  }

  function handleSaveDebtItem(id: number | null, input: DebtItemInput) {
    setResetMessage("");

    const nextItem: DebtItem = {
      id: id ?? Date.now(),
      created_at: id ? debtItems.find((item) => item.id === id)?.created_at ?? new Date().toISOString() : new Date().toISOString(),
      ...input
    };

    const nextItems = sortDebtItems([nextItem, ...debtItems.filter((item) => item.id !== nextItem.id)]);
    setDebtItems(nextItems);
    return id === null ? "借金内訳を追加しました。" : "借金内訳を更新しました。";
  }

  function handleDeleteDebtItem(id: number) {
    setResetMessage("");
    setDebtItems((current) => current.filter((item) => item.id !== id));
    return "借金内訳を削除しました。";
  }

  function handleResetAll() {
    const confirmed = window.confirm("このブラウザに保存されたデータをすべて初期化しますか？");
    if (!confirmed) {
      return;
    }

    clearAllStoredData();
    setRecords([]);
    setSettingsState({
      ...defaultSettings,
      updated_at: new Date().toISOString()
    });
    setDebtItems([]);
    setResetMessage("このブラウザの保存データを初期化しました。");
  }

  if (!hydrated) {
    return (
      <main className="page-stack">
        <section className="panel">
          <h2 className="panel__title">読み込み中...</h2>
          <p className="panel__description">このブラウザに保存されたデータを読み込んでいます。</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-stack">
      <nav className="tab-nav" aria-label="画面切り替え">
        {tabs.map((tab) => {
          const active = tab.key === initialTab;
          return (
            <Link key={tab.key} href={`/?tab=${tab.key}`} className={active ? "tab-nav__item tab-nav__item--active" : "tab-nav__item"}>
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {initialTab === "dashboard" ? (
        <section className="page-stack">
          <section className="panel reset-panel">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">このブラウザのデータ管理</h2>
                <p className="panel__description">他のユーザーとは共有されません。必要ならここで初期化できます。</p>
              </div>
              <button className="button button--danger" type="button" onClick={handleResetAll}>
                データを初期化
              </button>
            </div>
            {resetMessage ? <p className="success">{resetMessage}</p> : null}
          </section>

          <section className="metrics-grid">
            <MetricCard label="借金残高" value={formatCurrency(summary.currentBalance)} sub={`初期から ${formatCurrency(summary.debtReduction)} 減少`} />
            <MetricCard
              label="今月の収支"
              value={formatCurrency(summary.monthlyNet)}
              sub={`収入 ${formatCurrency(summary.monthlyIncome)} / 支出 ${formatCurrency(summary.monthlyExpense)}`}
            />
            <MetricCard label="今日の支出" value={formatCurrency(summary.todayExpense)} sub="今日の記録から自動表示" />
            <MetricCard label="ギャンブル断ち日数" value={`${formatNumber(summary.gamblingFreeDays)}日`} sub="開始日から自動計算" />
          </section>

          <section className="dashboard-grid">
            <section className="panel">
              <div className="panel__header">
                <div>
                  <h2 className="panel__title">3分で確認</h2>
                  <p className="panel__description">今の状況を大きな数字でまとめて確認できます。</p>
                </div>
              </div>
              <div className="summary-list">
                <div>
                  <span>月返済額の目安</span>
                  <strong>{formatCurrency(summary.monthlyPayment)}</strong>
                </div>
                <div>
                  <span>今月の返済合計</span>
                  <strong>{formatCurrency(summary.monthlyRepayment)}</strong>
                </div>
                <div>
                  <span>初期借入額</span>
                  <strong>{formatCurrency(summary.initialDebt)}</strong>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel__header">
                <div>
                  <h2 className="panel__title">借金内訳の要点</h2>
                  <p className="panel__description">このブラウザだけに保存された借金データを表示しています。</p>
                </div>
              </div>
              <div className="summary-list">
                <div>
                  <span>最優先返済</span>
                  <strong>{debtBreakdown.topPriorityDebt?.lender_name ?? "-"}</strong>
                </div>
                <div>
                  <span>総残高</span>
                  <strong>{formatCurrency(debtBreakdown.totalBalance)}</strong>
                </div>
                <div>
                  <span>総利息の簡易表示</span>
                  <strong>{formatCurrency(debtBreakdown.totalEstimatedMonthlyInterest)}</strong>
                </div>
              </div>
            </section>
          </section>
        </section>
      ) : null}

      {initialTab === "input" ? (
        <section className="page-stack">
          <section className="overview-grid">
            <DailyEntryForm suggestedBalance={summary.currentBalance} onSave={handleSaveRecord} />
            <SettingsForm settings={settings} onSave={handleSaveSettings} />
          </section>

          <section className="panel">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">記録履歴</h2>
                <p className="panel__description">このブラウザ内だけの履歴です。</p>
              </div>
            </div>
            <RecordsTable records={records} />
          </section>
        </section>
      ) : null}

      {initialTab === "debts" ? (
        <DebtBreakdownManager
          items={debtItems}
          summary={debtBreakdown}
          onSave={handleSaveDebtItem}
          onDelete={handleDeleteDebtItem}
        />
      ) : null}

      {initialTab === "graphs" ? <Charts data={chartData} /> : null}
    </main>
  );
}
