CREATE TABLE IF NOT EXISTS debt_settings (
  id INTEGER PRIMARY KEY,
  initial_debt INTEGER NOT NULL DEFAULT 0,
  current_balance INTEGER NOT NULL DEFAULT 0,
  monthly_payment INTEGER NOT NULL DEFAULT 0,
  gambling_start_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO debt_settings (id, initial_debt, current_balance, monthly_payment, gambling_start_date)
VALUES (1, 0, 0, 0, NULL)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS debt_records (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  income INTEGER NOT NULL DEFAULT 0,
  expense INTEGER NOT NULL DEFAULT 0,
  repayment_amount INTEGER NOT NULL DEFAULT 0,
  memo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debt_items (
  id BIGSERIAL PRIMARY KEY,
  lender_name TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  annual_interest_rate NUMERIC(8, 2) NOT NULL DEFAULT 0,
  minimum_payment INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
