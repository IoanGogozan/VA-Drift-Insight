import type { ImportRunSummary, PrivateServiceCaseSummary, WaterZoneSummary } from "@/lib/api";

type DataQualityOverviewProps = {
  importRuns: ImportRunSummary[];
  waterZones: WaterZoneSummary[];
  privateCases: PrivateServiceCaseSummary[];
};

type DataGap = {
  label: string;
  value: string | number;
  severity: "high" | "medium" | "low";
  recommendation: string;
};

export function DataQualityOverview({ importRuns, waterZones, privateCases }: DataQualityOverviewProps) {
  const latestRun = importRuns[0] ?? null;
  const validationIssues = latestRun?.validationErrors ?? [];
  const errorCount = validationIssues.filter((issue) => issue.severity === "error").length;
  const warningCount = validationIssues.filter((issue) => issue.severity === "warning").length;
  const avgDataQuality =
    waterZones.length > 0
      ? Math.round(
          waterZones.reduce((sum, zone) => sum + (zone.dataQualityScore ?? 0), 0) / Math.max(1, waterZones.length)
        )
      : 0;
  const privateCasesWithoutFollowUp = privateCases.filter(
    (item) => item.status !== "closed" && item.nextFollowUp === null
  ).length;
  const dataGaps = buildDataGaps(validationIssues, privateCasesWithoutFollowUp);

  return (
    <section className="border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-ink">Datakvalitet og datagap</h2>
        <p className="mt-1 text-sm text-muted">
          Datakvalitet behandles som en del av beslutningsgrunnlaget. Manglende alder, geometri, sensorhistorikk eller
          oppfølging skal redusere tillit og gi egne anbefalinger.
        </p>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-4">
        <QualityMetric
          label="Gj.sn. datakvalitet"
          value={`${avgDataQuality} %`}
          tone={avgDataQuality >= 70 ? "low" : "medium"}
        />
        <QualityMetric label="Valideringsfeil" value={errorCount} tone={errorCount > 0 ? "high" : "low"} />
        <QualityMetric label="Varsler" value={warningCount} tone={warningCount > 0 ? "medium" : "low"} />
        <QualityMetric
          label="Saker uten neste oppfølging"
          value={privateCasesWithoutFollowUp}
          tone={privateCasesWithoutFollowUp > 0 ? "medium" : "low"}
        />
      </div>

      <div className="border-t border-slate-100 p-6">
        <h3 className="text-sm font-semibold text-ink">Anbefalte forbedringer i datagrunnlaget</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {dataGaps.map((gap) => (
            <article key={gap.label} className="border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold text-ink">{gap.label}</h4>
                <span className={`px-2 py-1 text-xs font-semibold ${toneClass[gap.severity]}`}>{gap.value}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{gap.recommendation}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function buildDataGaps(
  validationIssues: ImportRunSummary["validationErrors"],
  privateCasesWithoutFollowUp: number
): DataGap[] {
  const missingPipeYears = validationIssues.filter(
    (issue) => issue.entityType === "pipe" && issue.field === "installed_year"
  ).length;
  const missingGeometry = validationIssues.filter((issue) => issue.field === "geometry").length;
  const missingTimeSeries = validationIssues.some(
    (issue) => issue.entityType === "time_series" && issue.field === "rows"
  );

  return [
    {
      label: "Ledningsregister",
      value: missingPipeYears,
      severity: missingPipeYears > 0 ? "medium" : "low",
      recommendation:
        missingPipeYears > 0
          ? "Oppdater manglende installasjonsår for eldre hovedledninger før sanerings- og lekkasjeprioritering brukes aktivt."
          : "Ledningsalder er tilstrekkelig dokumentert i demo-datasettet."
    },
    {
      label: "Kartposisjon",
      value: missingGeometry,
      severity: missingGeometry > 0 ? "high" : "low",
      recommendation:
        missingGeometry > 0
          ? "Koble hendelser og VA-objekter til kartposisjon for bedre historisk analyse og feltplanlegging."
          : "VA-objektene har geometri nok til å brukes i kartbasert beslutningsstøtte."
    },
    {
      label: "Driftsdata",
      value: missingTimeSeries ? "Gap" : "OK",
      severity: missingTimeSeries ? "medium" : "low",
      recommendation:
        "Etabler eller importer tidsserier for nattforbruk, trykk, flow og alarmer slik at scoringen kan følges over tid."
    },
    {
      label: "Privat oppfølging",
      value: privateCasesWithoutFollowUp,
      severity: privateCasesWithoutFollowUp > 0 ? "medium" : "low",
      recommendation:
        privateCasesWithoutFollowUp > 0
          ? "Sett neste oppfølgingsdato på åpne private stikkledningssaker for å gjøre arbeidsflyten sporbar."
          : "Åpne private saker har definert videre oppfølging."
    }
  ];
}

function QualityMetric({ label, value, tone }: { label: string; value: string | number; tone: DataGap["severity"] }) {
  return (
    <div className="border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${metricToneClass[tone]}`}>{value}</p>
    </div>
  );
}

const toneClass: Record<DataGap["severity"], string> = {
  high: "bg-red-50 text-riskHigh",
  medium: "bg-amber-50 text-riskMedium",
  low: "bg-green-50 text-riskLow"
};

const metricToneClass: Record<DataGap["severity"], string> = {
  high: "text-riskHigh",
  medium: "text-riskMedium",
  low: "text-riskLow"
};
