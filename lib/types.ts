export type DebtRecord = {
  id: number;
  date: string;
  income: number;
  expense: number;
  repayment_amount: number;
  memo: string;
  created_at: string;
};

export type DebtRecordInput = Omit<DebtRecord, "id" | "created_at">;

export type DebtSettings = {
  id: number;
  initial_debt: number;
  current_balance: number;
  monthly_payment: number;
  gambling_start_date: string | null;
  updated_at: string;
};

export type DebtSettingsInput = Omit<DebtSettings, "id" | "updated_at">;

export type DebtItem = {
  id: number;
  lender_name: string;
  balance: number;
  annual_interest_rate: number;
  minimum_payment: number;
  created_at: string;
};

export type DebtItemInput = Omit<DebtItem, "id" | "created_at">;

export type DashboardSummary = {
  currentBalance: number;
  initialDebt: number;
  monthlyPayment: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyRepayment: number;
  monthlyNet: number;
  todayExpense: number;
  gamblingFreeDays: number;
  debtReduction: number;
};

export type ChartPoint = {
  label: string;
  balance: number;
  expense: number;
};

export type DebtBreakdownSummary = {
  totalBalance: number;
  totalMinimumPayment: number;
  totalEstimatedMonthlyInterest: number;
  topPriorityDebt: DebtItem | null;
};
