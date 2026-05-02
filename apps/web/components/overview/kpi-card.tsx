type KpiCardProps = {
  label: string;
  value: number | string;
  tone?: "neutral" | "high" | "medium";
};

export function KpiCard({ label, value, tone = "neutral" }: KpiCardProps) {
  const toneClass =
    tone === "high" ? "text-riskHigh" : tone === "medium" ? "text-riskMedium" : "text-ink";

  return (
    <article className="border border-slate-200 bg-white p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${toneClass}`}>{value}</p>
    </article>
  );
}
