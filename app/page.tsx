import Link from "next/link";

import { Charts } from "@/components/charts";
import { DailyEntryForm } from "@/components/daily-entry-form";
import { DebtBreakdownManager } from "@/components/debt-breakdown-manager";
import { MetricCard } from "@/components/metric-card";
import { RecordsTable } from "@/components/records-table";
import { SettingsForm } from "@/components/settings-form";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  getAllRecords,
  getChartData,
  getDashboardSummary,
  getDebtBreakdownSummary,
  getDebtItems,
  getDebtSettings
} from "@/lib/records";

export const dynamic = "force-dynamic";

const tabs = [
  { key: "dashboard", label: "ダッシュボード" },
  { key: "input", label: "入力" },
  { key: "debts", label: "借金内訳" },
  { key: "graphs", label: "グラフ" }
] as const;

type TabKey = (typeof tabs)[number]["key"];

function isTabKey(value: string | undefined): value is TabKey {
  return tabs.some((tab) => tab.key === value);
}

export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const currentTab: TabKey = isTabKey(resolved?.tab) ? resolved.tab : "dashboard";

  const records = await getAllRecords();
  const summary = await getDashboardSummary(records);
  const chartData = await getChartData(records);
  const settings = await getDebtSettings();
  const debtItems = await getDebtItems();
  const debtBreakdown = getDebtBreakdownSummary(debtItems);

  return (
    <main className="page-stack">
      <nav className="tab-nav" aria-label="画面切り替え">
        {tabs.map((tab) => {
          const active = tab.key === currentTab;
          return (
            <Link
              key={tab.key}
              href={`/?tab=${tab.key}`}
              className={active ? "tab-nav__item tab-nav__item--active" : "tab-nav__item"}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {currentTab === "dashboard" ? (
        <section className="page-stack">
          <section className="metrics-grid">
            <MetricCard
              label="借金残高"
              value={formatCurrency(summary.currentBalance)}
              sub={`初期から ${formatCurrency(summary.debtReduction)} 減少`}
            />
            <MetricCard
              label="今月の収支"
              value={formatCurrency(summary.monthlyNet)}
              sub={`収入 ${formatCurrency(summary.monthlyIncome)} / 支出 ${formatCurrency(summary.monthlyExpense)}`}
            />
            <MetricCard label="今日の支出" value={formatCurrency(summary.todayExpense)} sub="今日の記録から自動表示" />
            <MetricCard
              label="ギャンブル断ち日数"
              value={`${formatNumber(summary.gamblingFreeDays)}日`}
              sub="開始日から自動計算"
            />
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
                  <p className="panel__description">優先して返す先と利息の目安をすぐ確認できます。</p>
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

      {currentTab === "input" ? (
        <section className="page-stack">
          <section className="overview-grid">
            <DailyEntryForm suggestedBalance={summary.currentBalance} />
            <SettingsForm settings={settings} />
          </section>

          <section className="panel">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">記録履歴</h2>
                <p className="panel__description">過去の入力をあとから見直せます。</p>
              </div>
            </div>
            <RecordsTable records={records} />
          </section>
        </section>
      ) : null}

      {currentTab === "debts" ? <DebtBreakdownManager items={debtItems} summary={debtBreakdown} /> : null}

      {currentTab === "graphs" ? <Charts data={chartData} /> : null}
    </main>
  );
}
