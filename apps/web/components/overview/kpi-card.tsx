type KpiCardProps = {
  label: string;
  value: number | string;
  tone?: "neutral" | "high" | "medium";
  helper?: string;
};

export function KpiCard({ label, value, tone = "neutral", helper }: KpiCardProps) {
  const toneClass =
    tone === "high" ? "text-riskHigh" : tone === "medium" ? "text-riskMedium" : "text-ink";
  const borderClass =
    tone === "high" ? "border-t-riskHigh" : tone === "medium" ? "border-t-riskMedium" : "border-t-slate-300";

  return (
    <article className={`min-h-32 border border-t-4 border-slate-200 bg-white p-4 ${borderClass}`}>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className={`mt-3 text-3xl font-semibold leading-none ${toneClass}`}>{value}</p>
      {helper ? <p className="mt-3 text-xs leading-5 text-muted">{helper}</p> : null}
    </article>
  );
}
