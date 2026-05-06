import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

import { formatCurrency } from "@/lib/format";
import { DebtRecord } from "@/lib/types";

export function RecordsTable({ records }: { records: DebtRecord[] }) {
  if (records.length === 0) {
    return <p className="empty-state">まだ記録がありません。今日の入力から始めましょう。</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>日付</th>
            <th>収入</th>
            <th>支出</th>
            <th>返済額</th>
            <th>メモ</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{format(parseISO(record.date), "M/d (E)", { locale: ja })}</td>
              <td>{formatCurrency(record.income)}</td>
              <td>{formatCurrency(record.expense)}</td>
              <td>{formatCurrency(record.repayment_amount)}</td>
              <td>{record.memo || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
