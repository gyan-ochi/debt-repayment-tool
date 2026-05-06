import { DebtItem, DebtRecord, DebtSettings } from "@/lib/types";

const STORAGE_KEYS = {
  records: "debt-tool-records",
  settings: "debt-tool-settings",
  debtItems: "debt-tool-debt-items"
} as const;

function safeParse<T>(value: string | null, fallback: T) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadRecords() {
  return safeParse<DebtRecord[]>(window.localStorage.getItem(STORAGE_KEYS.records), []);
}

export function loadSettings(fallback: DebtSettings) {
  return safeParse<DebtSettings>(window.localStorage.getItem(STORAGE_KEYS.settings), fallback);
}

export function loadDebtItems() {
  return safeParse<DebtItem[]>(window.localStorage.getItem(STORAGE_KEYS.debtItems), []);
}

export function saveRecords(records: DebtRecord[]) {
  window.localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
}

export function saveSettings(settings: DebtSettings) {
  window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function saveDebtItems(items: DebtItem[]) {
  window.localStorage.setItem(STORAGE_KEYS.debtItems, JSON.stringify(items));
}

export function clearAllStoredData() {
  window.localStorage.removeItem(STORAGE_KEYS.records);
  window.localStorage.removeItem(STORAGE_KEYS.settings);
  window.localStorage.removeItem(STORAGE_KEYS.debtItems);
}
