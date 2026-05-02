import { getOverview } from "@/lib/api";
import { UI_TEXT } from "@/lib/ui-text";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const overview = await getOverview();

  return (
    <main className="min-h-screen">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5">
          <p className="text-sm font-medium text-muted">{UI_TEXT.demoDataset}</p>
          <h1 className="text-2xl font-semibold tracking-normal text-ink">{UI_TEXT.overviewTitle}</h1>
          <p className="max-w-3xl text-sm text-muted">{UI_TEXT.subtitle}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-6 md:grid-cols-3">
        <KpiCard label={UI_TEXT.highRiskLeakageZones} value={overview.kpis.highRiskLeakageZones} />
        <KpiCard label={UI_TEXT.fremmedvannSuspicions} value={overview.kpis.fremmedvannSuspicions} />
        <KpiCard label={UI_TEXT.recommendedFieldChecks} value={overview.kpis.recommendedFieldChecks} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-8 lg:grid-cols-[1fr_360px]">
        <div className="min-h-[420px] border border-slate-200 bg-white p-4">
          <div className="flex h-full items-center justify-center border border-dashed border-slate-300 bg-surface text-sm text-muted">
            {UI_TEXT.mapPlaceholder}
          </div>
        </div>

        <aside className="border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold text-ink">{UI_TEXT.topRecommendations}</h2>
          <div className="mt-4 space-y-3">
            {overview.topRecommendations.map((recommendation) => (
              <article key={recommendation.id} className="border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-ink">{recommendation.areaName}</p>
                  <span className="text-xs font-medium uppercase text-riskHigh">{recommendation.priority}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{recommendation.reason}</p>
                <p className="mt-1 text-sm text-ink">{recommendation.suggestedAction}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="border border-slate-200 bg-white p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
    </article>
  );
}
