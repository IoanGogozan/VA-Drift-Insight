import type { PumpStationAnalysis, PumpStationSummary } from "@/lib/api";
import { UI_TEXT } from "@/lib/ui-text";

type PumpStationChartProps = {
  pumpStations: PumpStationSummary[];
  selectedPumpStationId: string | null;
  analysis: PumpStationAnalysis | null;
  isLoading: boolean;
  error: string | null;
  onSelectPumpStation: (pumpStationId: string) => void;
};

const chartWidth = 680;
const chartHeight = 240;
const chartPadding = 28;

export function PumpStationChart({
  pumpStations,
  selectedPumpStationId,
  analysis,
  isLoading,
  error,
  onSelectPumpStation
}: PumpStationChartProps) {
  return (
    <section className="border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">{UI_TEXT.fremmedvannTitle}</h2>
          <p className="text-sm text-muted">{UI_TEXT.fremmedvannSubtitle}</p>
        </div>
        <select
          value={selectedPumpStationId ?? ""}
          onChange={(event) => onSelectPumpStation(event.target.value)}
          className="border border-slate-300 bg-white px-3 py-2 text-sm text-ink"
          aria-label="Velg pumpestasjon"
        >
          {pumpStations.map((pumpStation) => (
            <option key={pumpStation.pumpStationId} value={pumpStation.pumpStationId}>
              {pumpStation.stationCode} {pumpStation.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        {isLoading ? <p className="text-sm text-muted">{UI_TEXT.loading}</p> : null}
        {error ? <p className="text-sm text-riskHigh">{error}</p> : null}
        {!isLoading && !analysis ? <p className="text-sm text-muted">{UI_TEXT.selectPumpStation}</p> : null}
        {analysis ? <ChartContent analysis={analysis} /> : null}
      </div>
    </section>
  );
}

function ChartContent({ analysis }: { analysis: PumpStationAnalysis }) {
  const runtimePoints = makePolyline(analysis.chartData.map((point) => point.pumpRuntimeMinutes));
  const rainfallBars = analysis.chartData.map((point, index) => {
    const barWidth = (chartWidth - chartPadding * 2) / analysis.chartData.length - 2;
    const x = chartPadding + index * (barWidth + 2);
    const barHeight = (point.rainfallMm / maxValue(analysis.chartData.map((item) => item.rainfallMm))) * 80;

    return <rect key={point.timestamp} x={x} y={chartHeight - chartPadding - barHeight} width={barWidth} height={barHeight} fill="#3b82a0" opacity="0.65" />;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="font-medium text-ink">
          {analysis.stationCode} {analysis.name}
        </span>
        <span className="text-riskHigh">Mistanke: {analysis.suspicionLevel}</span>
        <span className="text-muted">Score {analysis.suspicionScore}/100</span>
        <span className="text-muted">Tillit {analysis.confidence}%</span>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="block w-full border border-slate-200 bg-surface" role="img" aria-label="Regn og pumpetid">
        <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} stroke="#94a3b8" />
        {rainfallBars}
        <polyline points={runtimePoints} fill="none" stroke="#d94f45" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="flex gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 bg-[#3b82a0]" />
          Nedbør mm
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 bg-riskHigh" />
          Pumpetid min
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">Forklaring</h3>
          <p className="mt-1 text-sm leading-6 text-muted">{analysis.explanation}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink">Anbefalt tiltak</h3>
          <p className="mt-1 text-sm leading-6 text-ink">{analysis.recommendedAction}</p>
        </div>
      </div>
    </div>
  );
}

function makePolyline(values: number[]) {
  const max = maxValue(values);
  const step = (chartWidth - chartPadding * 2) / Math.max(1, values.length - 1);

  return values
    .map((value, index) => {
      const x = chartPadding + index * step;
      const y = chartHeight - chartPadding - (value / max) * (chartHeight - chartPadding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function maxValue(values: number[]) {
  return Math.max(1, ...values);
}
