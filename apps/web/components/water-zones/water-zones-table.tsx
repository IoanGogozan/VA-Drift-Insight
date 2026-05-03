import type { WaterZoneSummary } from "@/lib/api";

type WaterZonesTableProps = {
  waterZones: WaterZoneSummary[];
};

const statusClass: Record<WaterZoneSummary["status"], string> = {
  high: "border-red-200 bg-red-50 text-red-800",
  suspect: "border-amber-200 bg-amber-50 text-amber-800",
  normal: "border-emerald-200 bg-emerald-50 text-emerald-800"
};

export function WaterZonesTable({ waterZones }: WaterZonesTableProps) {
  return (
    <section id="lekkasjekontroll" className="scroll-mt-20 border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-ink">Lekkasjekontroll</h2>
        <p className="mt-1 text-sm text-muted">
          Vannsoner med estimert vanntap, nattforbruk og trend mot baseline.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-6 py-3 font-semibold">Sone</th>
              <th className="px-4 py-3 font-semibold">Forbruk</th>
              <th className="px-4 py-3 font-semibold">Nattforbruk</th>
              <th className="px-4 py-3 font-semibold">Baseline</th>
              <th className="px-4 py-3 font-semibold">Vanntap</th>
              <th className="px-4 py-3 font-semibold">Trend 30d</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {waterZones.map((zone) => (
              <tr key={zone.id} className="border-t border-slate-100">
                <td className="px-6 py-4 font-medium text-ink">{zone.name}</td>
                <td className="px-4 py-4">{formatNumber(zone.totalConsumptionM3Day)} m³/d</td>
                <td className="px-4 py-4">{zone.nightFlowM3h.toFixed(1)} m³/h</td>
                <td className="px-4 py-4">{zone.baselineNightFlowM3h.toFixed(1)} m³/h</td>
                <td className="px-4 py-4 font-medium">{zone.estimatedLossM3Day.toFixed(1)} m³/d</td>
                <td className="px-4 py-4">{formatTrend(zone.trend30d)}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex min-w-20 justify-center border px-2.5 py-1 text-xs font-semibold ${statusClass[zone.status]}`}
                  >
                    {zone.statusLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatTrend(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)} %`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 }).format(value);
}
