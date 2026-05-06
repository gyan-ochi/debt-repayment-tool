import { NextResponse } from "next/server";

import { addDebtItem, getDebtItems, validateDebtItem } from "@/lib/records";
import { DebtItemInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getDebtItems());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DebtItemInput;

    const payload: DebtItemInput = {
      lender_name: body.lender_name ?? "",
      balance: Number(body.balance),
      annual_interest_rate: Number(body.annual_interest_rate),
      minimum_payment: Number(body.minimum_payment)
    };

    const validationError = validateDebtItem(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await addDebtItem(payload);
    return NextResponse.json({ message: "借金内訳を追加しました。" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存中にエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
