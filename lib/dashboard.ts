import { differenceInCalendarDays, format, parseISO, startOfMonth } from "date-fns";
import { ja } from "date-fns/locale";

import { getEstimatedMonthlyInterest } from "@/lib/debt-utils";
import { ChartPoint, DashboardSummary, DebtBreakdownSummary, DebtItem, DebtRecord, DebtSettings } from "@/lib/types";

export const defaultSettings: DebtSettings = {
  id: 1,
  initial_debt: 0,
  current_balance: 0,
  monthly_payment: 0,
  gambling_start_date: null,
  updated_at: new Date(0).toISOString()
};

export function getDashboardSummary(settings: DebtSettings, records: DebtRecord[]): DashboardSummary {
  const today = format(new Date(), "yyyy-MM-dd");
  const currentMonth = startOfMonth(new Date());

  const monthlyRecords = records.filter((record) => parseISO(record.date) >= currentMonth);
  const monthlyIncome = monthlyRecords.reduce((sum, record) => sum + record.income, 0);
  const monthlyExpense = monthlyRecords.reduce((sum, record) => sum + record.expense, 0);
  const monthlyRepayment = monthlyRecords.reduce((sum, record) => sum + record.repayment_amount, 0);
  const todayExpense = records.find((record) => record.date === today)?.expense ?? 0;

  const gamblingFreeDays = settings.gambling_start_date
    ? Math.max(differenceInCalendarDays(new Date(), parseISO(settings.gambling_start_date)), 0)
    : 0;

  return {
    currentBalance: settings.current_balance,
    initialDebt: settings.initial_debt,
    monthlyPayment: settings.monthly_payment,
    monthlyIncome,
    monthlyExpense,
    monthlyRepayment,
    monthlyNet: monthlyIncome - monthlyExpense - monthlyRepayment,
    todayExpense,
    gamblingFreeDays,
    debtReduction: Math.max(settings.initial_debt - settings.current_balance, 0)
  };
}

export function getChartData(settings: DebtSettings, records: DebtRecord[]): ChartPoint[] {
  const ordered = [...records].sort((a, b) => (a.date > b.date ? 1 : -1));
  let runningBalance = settings.initial_debt;

  return ordered.map((record) => {
    runningBalance = Math.max(runningBalance - record.repayment_amount, 0);

    return {
      label: format(parseISO(record.date), "M/d", { locale: ja }),
      balance: runningBalance,
      expense: record.expense
    };
  });
}

export function getDebtBreakdownSummary(items: DebtItem[]): DebtBreakdownSummary {
  return {
    totalBalance: items.reduce((sum, item) => sum + item.balance, 0),
    totalMinimumPayment: items.reduce((sum, item) => sum + item.minimum_payment, 0),
    totalEstimatedMonthlyInterest: items.reduce(
      (sum, item) => sum + getEstimatedMonthlyInterest(item.balance, item.annual_interest_rate),
      0
    ),
    topPriorityDebt: items[0] ?? null
  };
}
