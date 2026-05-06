"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { ChartPoint } from "@/lib/types";

type ChartsProps = {
  data: ChartPoint[];
};

export function Charts({ data }: ChartsProps) {
  return (
    <section className="charts-grid">
      <article className="panel chart-panel">
        <div className="panel__header">
          <div>
            <h2 className="panel__title">借金の減少推移</h2>
            <p className="panel__description">返済が進んでいるかを線で確認できます。</p>
          </div>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid stroke="#ececec" vertical={false} />
              <XAxis dataKey="label" stroke="#6f6f6f" />
              <YAxis stroke="#6f6f6f" tickFormatter={(value) => `${Math.round(value / 10000)}万`} />
              <Tooltip formatter={(value: number) => `¥${value.toLocaleString("ja-JP")}`} />
              <Line type="monotone" dataKey="balance" stroke="#111111" strokeWidth={3} dot={{ r: 3 }} name="借金残高" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel chart-panel">
        <div className="panel__header">
          <div>
            <h2 className="panel__title">支出推移</h2>
            <p className="panel__description">無理なく支出を減らせているかを見られます。</p>
          </div>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid stroke="#ececec" vertical={false} />
              <XAxis dataKey="label" stroke="#6f6f6f" />
              <YAxis stroke="#6f6f6f" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
              <Tooltip formatter={(value: number) => `¥${value.toLocaleString("ja-JP")}`} />
              <Bar dataKey="expense" fill="#7d7d7d" radius={[10, 10, 0, 0]} name="支出" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}
