import { NextResponse } from "next/server";

import { getDebtSettings, updateDebtSettings, validateSettings } from "@/lib/records";
import { DebtSettingsInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getDebtSettings());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DebtSettingsInput;

    const payload: DebtSettingsInput = {
      initial_debt: Number(body.initial_debt),
      current_balance: Number(body.current_balance),
      monthly_payment: Number(body.monthly_payment),
      gambling_start_date: body.gambling_start_date || null
    };

    const validationError = validateSettings(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await updateDebtSettings(payload);
    return NextResponse.json({ message: "借金設定を保存しました。" });
  } catch {
    return NextResponse.json({ error: "保存中にエラーが発生しました。" }, { status: 400 });
  }
}
