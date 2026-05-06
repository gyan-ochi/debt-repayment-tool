import { differenceInCalendarDays, format, parseISO, startOfMonth } from "date-fns";
import { ja } from "date-fns/locale";

import { getEstimatedMonthlyInterest } from "@/lib/debt-utils";
import { query } from "@/lib/db";
import {
  ChartPoint,
  DashboardSummary,
  DebtBreakdownSummary,
  DebtItem,
  DebtItemInput,
  DebtRecord,
  DebtRecordInput,
  DebtSettings,
  DebtSettingsInput
} from "@/lib/types";

function normalizeDebtItem(row: {
  id: number | string;
  lender_name: string;
  balance: number | string;
  annual_interest_rate: number | string;
  minimum_payment: number | string;
  created_at: string;
}): DebtItem {
  return {
    id: Number(row.id),
    lender_name: row.lender_name,
    balance: Number(row.balance),
    annual_interest_rate: Number(row.annual_interest_rate),
    minimum_payment: Number(row.minimum_payment),
    created_at: row.created_at
  };
}

function normalizeDebtRecord(row: {
  id: number | string;
  date: string | Date;
  income: number | string;
  expense: number | string;
  repayment_amount: number | string;
  memo: string;
  created_at: string;
}): DebtRecord {
  return {
    id: Number(row.id),
    date: typeof row.date === "string" ? row.date.slice(0, 10) : format(row.date, "yyyy-MM-dd"),
    income: Number(row.income),
    expense: Number(row.expense),
    repayment_amount: Number(row.repayment_amount),
    memo: row.memo,
    created_at: row.created_at
  };
}

function normalizeDebtSettings(row: {
  id: number | string;
  initial_debt: number | string;
  current_balance: number | string;
  monthly_payment: number | string;
  gambling_start_date: string | Date | null;
  updated_at: string;
}): DebtSettings {
  return {
    id: Number(row.id),
    initial_debt: Number(row.initial_debt),
    current_balance: Number(row.current_balance),
    monthly_payment: Number(row.monthly_payment),
    gambling_start_date:
      typeof row.gambling_start_date === "string"
        ? row.gambling_start_date.slice(0, 10)
        : row.gambling_start_date
          ? format(row.gambling_start_date, "yyyy-MM-dd")
          : null,
    updated_at: row.updated_at
  };
}

export async function getAllRecords() {
  const result = await query<{
    id: number | string;
    date: string | Date;
    income: number | string;
    expense: number | string;
    repayment_amount: number | string;
    memo: string;
    created_at: string;
  }>("SELECT * FROM debt_records ORDER BY date DESC");
  return result.rows.map(normalizeDebtRecord);
}

export async function getDebtSettings() {
  const result = await query<{
    id: number | string;
    initial_debt: number | string;
    current_balance: number | string;
    monthly_payment: number | string;
    gambling_start_date: string | Date | null;
    updated_at: string;
  }>("SELECT * FROM debt_settings WHERE id = 1");

  return normalizeDebtSettings(result.rows[0]);
}

export async function getDebtItems() {
  const result = await query<{
    id: number | string;
    lender_name: string;
    balance: number | string;
    annual_interest_rate: number | string;
    minimum_payment: number | string;
    created_at: string;
  }>("SELECT * FROM debt_items ORDER BY annual_interest_rate DESC, balance DESC, id ASC");

  return result.rows.map(normalizeDebtItem);
}

export async function updateDebtSettings(input: DebtSettingsInput) {
  return query(
    `
      UPDATE debt_settings
      SET
        initial_debt = $1,
        current_balance = $2,
        monthly_payment = $3,
        gambling_start_date = $4,
        updated_at = NOW()
      WHERE id = 1
    `,
    [input.initial_debt, input.current_balance, input.monthly_payment, input.gambling_start_date]
  );
}

export async function saveDailyRecord(input: DebtRecordInput) {
  return query(
    `
      INSERT INTO debt_records (date, income, expense, repayment_amount, memo)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT(date) DO UPDATE SET
        income = EXCLUDED.income,
        expense = EXCLUDED.expense,
        repayment_amount = EXCLUDED.repayment_amount,
        memo = EXCLUDED.memo
    `,
    [input.date, input.income, input.expense, input.repayment_amount, input.memo]
  );
}

export async function addDebtItem(input: DebtItemInput) {
  return query(
    `
      INSERT INTO debt_items (lender_name, balance, annual_interest_rate, minimum_payment)
      VALUES ($1, $2, $3, $4)
    `,
    [input.lender_name, input.balance, input.annual_interest_rate, input.minimum_payment]
  );
}

export async function editDebtItem(id: number, input: DebtItemInput) {
  return query(
    `
      UPDATE debt_items
      SET lender_name = $1, balance = $2, annual_interest_rate = $3, minimum_payment = $4
      WHERE id = $5
    `,
    [input.lender_name, input.balance, input.annual_interest_rate, input.minimum_payment, id]
  );
}

export async function deleteDebtItem(id: number) {
  return query("DELETE FROM debt_items WHERE id = $1", [id]);
}

export async function getRecordByDate(date: string) {
  const result = await query<{
    id: number | string;
    date: string | Date;
    income: number | string;
    expense: number | string;
    repayment_amount: number | string;
    memo: string;
    created_at: string;
  }>("SELECT * FROM debt_records WHERE date = $1", [date]);

  return result.rows[0] ? normalizeDebtRecord(result.rows[0]) : null;
}

export async function getDashboardSummary(records: DebtRecord[]): Promise<DashboardSummary> {
  const settings = await getDebtSettings();
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

export async function getChartData(records: DebtRecord[]): Promise<ChartPoint[]> {
  const settings = await getDebtSettings();
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

export function validateRecord(input: DebtRecordInput) {
  if (!input.date) {
    return "日付を入れてください。";
  }

  const numericFields: Array<keyof Omit<DebtRecordInput, "date" | "memo">> = ["income", "expense", "repayment_amount"];

  for (const field of numericFields) {
    if (Number.isNaN(input[field]) || input[field] < 0) {
      return "収入・支出・返済額は0以上の数字で入力してください。";
    }
  }

  return null;
}

export function validateSettings(input: DebtSettingsInput) {
  if ([input.initial_debt, input.current_balance, input.monthly_payment].some((value) => Number.isNaN(value) || value < 0)) {
    return "借金設定は0以上の数字で入力してください。";
  }

  if (input.current_balance > input.initial_debt) {
    return "現在残高は初期借入額以下で入力してください。";
  }

  return null;
}

export function validateDebtItem(input: DebtItemInput) {
  if (!input.lender_name.trim()) {
    return "借入先名を入れてください。";
  }

  if ([input.balance, input.annual_interest_rate, input.minimum_payment].some((value) => Number.isNaN(value) || value < 0)) {
    return "残高・金利・最低返済額は0以上で入力してください。";
  }

  return null;
}
