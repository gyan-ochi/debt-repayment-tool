import { Pool, QueryResultRow } from "pg";

declare global {
  var debtToolPool: Pool | undefined;
  var debtToolReady: Promise<void> | undefined;
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add your Supabase Postgres connection string to the environment variables.");
  }

  globalThis.debtToolPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
  });

  return globalThis.debtToolPool;
}

async function ensureDatabase() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS debt_settings (
      id INTEGER PRIMARY KEY,
      initial_debt INTEGER NOT NULL DEFAULT 0,
      current_balance INTEGER NOT NULL DEFAULT 0,
      monthly_payment INTEGER NOT NULL DEFAULT 0,
      gambling_start_date DATE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

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
  `);

  await pool.query(`
    INSERT INTO debt_settings (id, initial_debt, current_balance, monthly_payment, gambling_start_date)
    VALUES (1, 0, 0, 0, NULL)
    ON CONFLICT (id) DO NOTHING
  `);
}

export async function initDatabase() {
  globalThis.debtToolReady ??= ensureDatabase();
  await globalThis.debtToolReady;
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  await initDatabase();
  return getPool().query<T>(text, values);
}
