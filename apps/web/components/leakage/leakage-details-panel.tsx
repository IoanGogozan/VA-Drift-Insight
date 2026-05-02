import type { LeakageZoneAnalysis, LeakageZoneSummary } from "@/lib/api";
import { UI_TEXT } from "@/lib/ui-text";

type LeakageDetailsPanelProps = {
  zones: LeakageZoneSummary[];
  selectedZoneId: string | null;
  analysis: LeakageZoneAnalysis | null;
  isLoading: boolean;
  error: string | null;
  onSelectZone: (zoneId: string) => void;
};

export function LeakageDetailsPanel({
  zones,
  selectedZoneId,
  analysis,
  isLoading,
  error,
  onSelectZone
}: LeakageDetailsPanelProps) {
  return (
    <section className="border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-ink">{UI_TEXT.leakageTitle}</h2>
        <p className="text-sm text-muted">{UI_TEXT.decisionSupportNote}</p>
        <select
          value={selectedZoneId ?? ""}
          onChange={(event) => onSelectZone(event.target.value)}
          className="mt-2 border border-slate-300 bg-white px-3 py-2 text-sm text-ink"
          aria-label="Velg målesone"
        >
          {zones.map((zone) => (
            <option key={zone.zoneId} value={zone.zoneId}>
              {zone.name} - risiko {zone.riskScore}/100
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 min-h-72">
        {isLoading ? <p className="text-sm text-muted">{UI_TEXT.loading}</p> : null}
        {error ? <p className="text-sm text-riskHigh">{error}</p> : null}
        {!isLoading && !analysis ? <p className="text-sm text-muted">{UI_TEXT.selectZone}</p> : null}
        {analysis ? <AnalysisContent analysis={analysis} /> : null}
      </div>
    </section>
  );
}

function AnalysisContent({ analysis }: { analysis: LeakageZoneAnalysis }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted">{analysis.name}</p>
        <div className="mt-2 flex items-end gap-3">
          <p className="text-4xl font-semibold text-riskHigh">{analysis.riskScore}</p>
          <p className="pb-1 text-sm text-muted">/100 risiko, {analysis.confidence}% tillit</p>
        </div>
      </div>

      <FactorBars factors={analysis.factors} />

      <div>
        <h3 className="text-sm font-semibold text-ink">Forklaring</h3>
        <p className="mt-1 text-sm leading-6 text-muted">{analysis.explanation}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink">Anbefalt tiltak</h3>
        <p className="mt-1 text-sm leading-6 text-ink">{analysis.recommendedAction}</p>
      </div>
    </div>
  );
}

function FactorBars({ factors }: { factors: Record<string, number> }) {
  return (
    <div className="space-y-2">
      {Object.entries(factors).map(([key, value]) => (
        <div key={key}>
          <div className="flex justify-between gap-3 text-xs text-muted">
            <span>{formatFactor(key)}</span>
            <span>{value}</span>
          </div>
          <div className="mt-1 h-2 bg-surface">
            <div className="h-2 bg-ink" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatFactor(value: string) {
  const labels: Record<string, string> = {
    pipeAge: "Ledningsalder",
    material: "Materiale",
    historicalBreaks: "Tidligere brudd",
    nightFlowAnomaly: "Avvik i nattforbruk",
    pressureVariation: "Trykkvariasjon",
    criticality: "Kritikalitet"
  };

  return labels[value] ?? value.replace(/([A-Z])/g, " $1").replace(/^./, (first) => first.toUpperCase());
}
