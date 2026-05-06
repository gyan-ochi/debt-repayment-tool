type MetricCardProps = {
  label: string;
  value: string;
  sub?: string;
};

export function MetricCard({ label, value, sub }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className="metric-card__label">{label}</div>
      <div className="metric-card__value">{value}</div>
      {sub ? <div className="metric-card__sub">{sub}</div> : null}
    </article>
  );
}
