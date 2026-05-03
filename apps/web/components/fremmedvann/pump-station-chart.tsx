import type { PumpStationAnalysis, PumpStationSummary, RainfallResponse } from "@/lib/api";
import { UI_TEXT } from "@/lib/ui-text";

type PumpStationChartProps = {
  pumpStations: PumpStationSummary[];
  selectedPumpStationId: string | null;
  analysis: PumpStationAnalysis | null;
  rainfall: RainfallResponse;
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
  rainfall,
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
        {analysis ? <ChartContent analysis={analysis} rainfall={rainfall} /> : null}
      </div>
    </section>
  );
}

function ChartContent({ analysis, rainfall }: { analysis: PumpStationAnalysis; rainfall: RainfallResponse }) {
  const runtimePoints = makePolyline(analysis.chartData.map((point) => point.pumpRuntimeMinutes));
  const baselinePoints = makePolyline(analysis.chartData.map((point) => point.dryWeatherBaselineMinutes));
  const anomalyRange = getAnomalyRange(analysis.chartData.map((point) => point.isAnomaly));
  const rainfallBars = analysis.chartData.map((point, index) => {
    const barWidth = (chartWidth - chartPadding * 2) / analysis.chartData.length - 2;
    const x = chartPadding + index * (barWidth + 2);
    const barHeight = (point.rainfallMm / maxValue(analysis.chartData.map((item) => item.rainfallMm))) * 80;

    return (
      <rect
        key={point.timestamp}
        x={x}
        y={chartHeight - chartPadding - barHeight}
        width={barWidth}
        height={barHeight}
        fill="#3b82a0"
        opacity="0.65"
      />
    );
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
      <p className="text-xs text-muted">
        Datakilde: Nedbør fra {rainfall.source}. Pumpedata er simulert demo-data.
      </p>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="block w-full border border-slate-200 bg-surface"
        role="img"
        aria-label="Regn, baseline og pumpetid"
      >
        <line
          x1={chartPadding}
          y1={chartHeight - chartPadding}
          x2={chartWidth - chartPadding}
          y2={chartHeight - chartPadding}
          stroke="#94a3b8"
        />
        {anomalyRange ? <AnomalyBand start={anomalyRange.start} end={anomalyRange.end} pointCount={analysis.chartData.length} /> : null}
        {rainfallBars}
        <polyline
          points={baselinePoints}
          fill="none"
          stroke="#1f2a2e"
          strokeWidth="2"
          strokeDasharray="6 5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={runtimePoints}
          fill="none"
          stroke="#d94f45"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="flex flex-wrap gap-4 text-xs text-muted">
        <Legend color="#3b82a0" label="Nedbør mm" />
        <Legend color="#d94f45" label="Pumpetid min" />
        <Legend color="#1f2a2e" label="Tørrværsbaseline" outlined />
        <Legend color="#fde68a" label="Anomali" />
      </div>

      <DryWetMetrics analysis={analysis} />

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

function DryWetMetrics({ analysis }: { analysis: PumpStationAnalysis }) {
  const metrics = analysis.dryWetMetrics;

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Metric label="Tørrværsbaseline" value={`${metrics.dryWeatherBaselineMinutes} min/t`} />
      <Metric label="Våtvær topp" value={`${metrics.wetWeatherPeakRuntimeMinutes} min/t`} />
      <Metric label="Økning" value={`${metrics.pumpRuntimeIncreasePercent} %`} />
      <Metric label="Forsinkelse" value={`${metrics.responseDelayHours} t`} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-100 bg-white p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

function Legend({ color, label, outlined = false }: { color: string; label: string; outlined?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5" style={{ backgroundColor: outlined ? "transparent" : color, border: `1px solid ${color}` }} />
      {label}
    </span>
  );
}

function AnomalyBand({ start, end, pointCount }: { start: number; end: number; pointCount: number }) {
  const step = (chartWidth - chartPadding * 2) / Math.max(1, pointCount - 1);
  const x = chartPadding + start * step;
  const width = Math.max(step, (end - start + 1) * step);

  return (
    <rect
      x={x}
      y={chartPadding}
      width={width}
      height={chartHeight - chartPadding * 2}
      fill="#facc15"
      opacity="0.18"
    />
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

function getAnomalyRange(values: boolean[]) {
  const start = values.findIndex(Boolean);

  if (start < 0) {
    return null;
  }

  let end = start;

  for (let index = start + 1; index < values.length; index += 1) {
    if (!values[index]) {
      break;
    }

    end = index;
  }

  return { start, end };
}
