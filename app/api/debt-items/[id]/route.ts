import { NextResponse } from "next/server";

import { deleteDebtItem, editDebtItem, validateDebtItem } from "@/lib/records";
import { DebtItemInput } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const itemId = Number(id);
    const body = (await request.json()) as DebtItemInput;

    const payload: DebtItemInput = {
      lender_name: body.lender_name ?? "",
      balance: Number(body.balance),
      annual_interest_rate: Number(body.annual_interest_rate),
      minimum_payment: Number(body.minimum_payment)
    };

    if (Number.isNaN(itemId) || itemId <= 0) {
      return NextResponse.json({ error: "編集する借金が見つかりません。" }, { status: 400 });
    }

    const validationError = validateDebtItem(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await editDebtItem(itemId, payload);
    return NextResponse.json({ message: "借金内訳を更新しました。" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新中にエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const itemId = Number(id);

    if (Number.isNaN(itemId) || itemId <= 0) {
      return NextResponse.json({ error: "削除する借金が見つかりません。" }, { status: 400 });
    }

    await deleteDebtItem(itemId);
    return NextResponse.json({ message: "借金内訳を削除しました。" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "削除中にエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
