import { NextResponse } from "next/server";

import { getDebtSettings, getRecordByDate, saveDailyRecord, updateDebtSettings, validateRecord } from "@/lib/records";
import { DebtRecordInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DebtRecordInput;
    const settings = await getDebtSettings();
    const existingRecord = await getRecordByDate(body.date);

    const payload: DebtRecordInput = {
      date: body.date,
      income: Number(body.income),
      expense: Number(body.expense),
      repayment_amount: Number(body.repayment_amount),
      memo: body.memo ?? ""
    };

    const validationError = validateRecord(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await saveDailyRecord(payload);

    const previousRepayment = existingRecord?.repayment_amount ?? 0;
    const nextBalance = Math.max(settings.current_balance + previousRepayment - payload.repayment_amount, 0);

    await updateDebtSettings({
      initial_debt: settings.initial_debt,
      current_balance: nextBalance,
      monthly_payment: settings.monthly_payment,
      gambling_start_date: settings.gambling_start_date
    });

    return NextResponse.json({
      message: "記録を保存しました。",
      suggestedBalance: nextBalance
    });
  } catch {
    return NextResponse.json({ error: "保存中にエラーが発生しました。" }, { status: 400 });
  }
}
