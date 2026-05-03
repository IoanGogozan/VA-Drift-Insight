import type { MonthlyReportSummary } from "@/lib/api";

type MonthlyReportCardProps = {
  report: MonthlyReportSummary;
};

export function MonthlyReportCard({ report }: MonthlyReportCardProps) {
  return (
    <section className="border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-ink">Månedsrapport</h2>
        <p className="mt-1 text-sm text-muted">
          Operasjonelt sammendrag for {report.period.label}: lekkasjer, private saker og feltoppgaver.
        </p>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-4">
        <Metric label="Lekkasjer funnet" value={report.leaksFound} />
        <Metric label="Estimert spart" value={`${report.estimatedSavedM3} m³`} />
        <Metric label="Åpne saker" value={report.openCases} />
        <Metric label="Utførte feltoppgaver" value={report.completedFieldTasks} />
      </div>

      <div className="grid gap-6 border-t border-slate-100 p-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">Fordeling</h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="border border-slate-100 p-3">
              <dt className="text-muted">Kommunal</dt>
              <dd className="mt-1 text-lg font-semibold text-ink">{report.municipal}</dd>
            </div>
            <div className="border border-slate-100 p-3">
              <dt className="text-muted">Privat</dt>
              <dd className="mt-1 text-lg font-semibold text-ink">{report.private}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Anbefalte soner</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {report.recommendedZones.length > 0 ? (
              report.recommendedZones.map((zone) => (
                <span key={zone} className="border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-ink">
                  {zone}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted">Ingen anbefalte soner denne måneden.</p>
            )}
          </div>
          <p className="mt-3 text-sm text-muted">
            Estimert åpent vanntap i høyrisikosoner: {report.estimatedOpenLossM3Day.toFixed(1)} m³/dag.
          </p>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-slate-100 p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
