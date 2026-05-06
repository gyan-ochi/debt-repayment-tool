import { DebtItemInput, DebtRecordInput, DebtSettingsInput } from "@/lib/types";

export const defaultSettings: DebtSettingsInput = {
  initial_debt: 0,
  current_balance: 0,
  monthly_payment: 0,
  gambling_start_date: null
};

export const sampleRecords: DebtRecordInput[] = [];

export const sampleDebtItems: DebtItemInput[] = [];
