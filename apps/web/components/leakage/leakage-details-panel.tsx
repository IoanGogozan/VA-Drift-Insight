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

      {analysis.keyMetrics ? <KeyMetrics metrics={analysis.keyMetrics} /> : null}

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

function KeyMetrics({ metrics }: { metrics: NonNullable<LeakageZoneAnalysis["keyMetrics"]> }) {
  return (
    <dl className="grid grid-cols-2 gap-2 text-sm">
      <Metric label="Nattforbruk" value={`+${metrics.nightFlowIncreasePercent} %`} />
      <Metric label="Estimert vanntap" value={`${metrics.estimatedLossM3Day.toFixed(1)} m³/d`} />
      <Metric label="Tidligere lekkasjer" value={metrics.previousLeaks} />
      <Metric label="Private saker" value={metrics.privateCasesOpen} />
      <Metric label="30d trend" value={formatTrend(metrics.trend30d)} />
      <Metric label="Metode" value={capitalize(metrics.recommendedMethod)} />
    </dl>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-slate-100 bg-slate-50 p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">{value}</dd>
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
            <span>{formatFactorValue(key, value)}</span>
          </div>
          <div className="mt-1 h-2 bg-surface">
            <div className="h-2 bg-ink" style={{ width: `${getFactorWidth(key, value)}%` }} />
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
    criticality: "Kritikalitet",
    nightFlowIncreasePercent: "Økning i nattforbruk (%)",
    estimatedLossM3Day: "Estimert vanntap",
    avgPipeAge: "Gj.sn. ledningsalder",
    previousLeaks: "Tidligere lekkasjer/brudd",
    privateCasesOpen: "Åpne private saker",
    customerComplaints: "Kundemeldinger",
    trend7d: "Trend 7 dager",
    trend30d: "Trend 30 dager"
  };

  return labels[value] ?? value.replace(/([A-Z])/g, " $1").replace(/^./, (first) => first.toUpperCase());
}

function formatFactorValue(key: string, value: number) {
  if (key === "nightFlowIncreasePercent") {
    return `${value} %`;
  }

  if (key === "avgPipeAge") {
    return `${value} år`;
  }

  if (key === "estimatedLossM3Day") {
    return `${value} m³/d`;
  }

  if (key === "pressureVariation" || key === "trend7d" || key === "trend30d") {
    return `${value} %`;
  }

  return String(value);
}

function getFactorWidth(key: string, value: number) {
  if (key === "previousLeaks" || key === "customerComplaints" || key === "privateCasesOpen") {
    return Math.min(100, value * 25);
  }

  if (key === "estimatedLossM3Day") {
    return Math.min(100, value);
  }

  if (key === "pressureVariation" || key === "trend7d" || key === "trend30d") {
    return Math.min(100, value * 4);
  }

  return Math.min(100, Math.max(0, value));
}

function formatTrend(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)} %`;
}

function capitalize(value: string) {
  return value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}
