"use client";

import { useEffect, useState } from "react";
import type {
  FieldTaskSummary,
  LeakageZoneAnalysis,
  LeakageZoneSummary,
  ImportRunSummary,
  MapAssetFeature,
  MapAssetsResponse,
  MapContextResponse,
  MonthlyReportSummary,
  OverviewResponse,
  PrivateServiceCaseSummary,
  PumpStationAnalysis,
  PumpStationSummary,
  RainfallResponse,
  RecommendationSummary,
  WaterZoneSummary
} from "@/lib/api";
import { fetchLeakageZoneAnalysis, fetchPumpStationAnalysis } from "@/lib/client-api";
import { UI_TEXT } from "@/lib/ui-text";
import { FieldTasksTable } from "../field-tasks/field-tasks-table";
import { PumpStationChart } from "../fremmedvann/pump-station-chart";
import { DataImportPanel } from "../imports/data-import-panel";
import { DataQualityOverview } from "../imports/data-quality-overview";
import { LeakageDetailsPanel } from "../leakage/leakage-details-panel";
import { RiskMap } from "../map/risk-map";
import { DataSourcesCard } from "../overview/data-sources-card";
import { KpiCard } from "../overview/kpi-card";
import { PrivateCasesTable } from "../private-cases/private-cases-table";
import { RecommendationsTable } from "../recommendations/recommendations-table";
import { MonthlyReportCard } from "../reports/monthly-report-card";
import { ReportButton } from "../reports/report-button";
import { WaterZonesTable } from "../water-zones/water-zones-table";

type DashboardScreenProps = {
  overview: OverviewResponse;
  mapAssets: MapAssetsResponse;
  mapContext: MapContextResponse;
  rainfall: RainfallResponse;
  leakageZones: LeakageZoneSummary[];
  waterZones: WaterZoneSummary[];
  privateCases: PrivateServiceCaseSummary[];
  fieldTasks: FieldTaskSummary[];
  pumpStations: PumpStationSummary[];
  recommendations: RecommendationSummary[];
  importRuns: ImportRunSummary[];
  monthlyReport: MonthlyReportSummary;
  initialLeakageAnalysis: LeakageZoneAnalysis | null;
  initialPumpStationAnalysis: PumpStationAnalysis | null;
};

export function DashboardScreen({
  overview,
  mapAssets,
  mapContext,
  rainfall,
  leakageZones,
  waterZones,
  privateCases,
  fieldTasks,
  pumpStations,
  recommendations,
  importRuns,
  monthlyReport,
  initialLeakageAnalysis,
  initialPumpStationAnalysis
}: DashboardScreenProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState(leakageZones[0]?.zoneId ?? null);
  const [selectedPumpStationId, setSelectedPumpStationId] = useState(pumpStations[0]?.pumpStationId ?? null);
  const [leakageAnalysis, setLeakageAnalysis] = useState<LeakageZoneAnalysis | null>(initialLeakageAnalysis);
  const [pumpStationAnalysis, setPumpStationAnalysis] = useState<PumpStationAnalysis | null>(
    initialPumpStationAnalysis
  );
  const [leakageError, setLeakageError] = useState<string | null>(null);
  const [pumpStationError, setPumpStationError] = useState<string | null>(null);
  const [loadingLeakage, setLoadingLeakage] = useState(false);
  const [loadingPumpStation, setLoadingPumpStation] = useState(false);

  useEffect(() => {
    if (!selectedZoneId) {
      return;
    }

    if (selectedZoneId === initialLeakageAnalysis?.zoneId) {
      setLeakageAnalysis(initialLeakageAnalysis);
      return;
    }

    setLoadingLeakage(true);
    setLeakageError(null);
    fetchLeakageZoneAnalysis(selectedZoneId)
      .then(setLeakageAnalysis)
      .catch(() => setLeakageError("Kunne ikke hente lekkasjedetaljer."))
      .finally(() => setLoadingLeakage(false));
  }, [selectedZoneId]);

  useEffect(() => {
    if (!selectedPumpStationId) {
      return;
    }

    if (selectedPumpStationId === initialPumpStationAnalysis?.pumpStationId) {
      setPumpStationAnalysis(initialPumpStationAnalysis);
      return;
    }

    setLoadingPumpStation(true);
    setPumpStationError(null);
    fetchPumpStationAnalysis(selectedPumpStationId)
      .then(setPumpStationAnalysis)
      .catch(() => setPumpStationError("Kunne ikke hente pumpestasjonsdata."))
      .finally(() => setLoadingPumpStation(false));
  }, [selectedPumpStationId]);

  function handleSelectAsset(feature: MapAssetFeature) {
    setSelectedAssetId(feature.id);

    if (feature.properties.assetType === "zone" && feature.properties.subtype === "water_meter_zone") {
      setSelectedZoneId(feature.id);
    }

    if (feature.properties.assetType === "pump_station") {
      setSelectedPumpStationId(feature.id);
    }
  }

  const estimatedWaterLoss = waterZones.reduce((sum, zone) => sum + zone.estimatedLossM3Day, 0);
  const highWaterZones = waterZones.filter((zone) => zone.status === "high").length;
  const activePrivateCases = privateCases.filter((item) => item.status !== "closed").length;
  const openFieldTasks = fieldTasks.filter((task) => ["new", "planned", "in_progress"].includes(task.status)).length;
  const averageTrend30d =
    waterZones.length > 0 ? waterZones.reduce((sum, zone) => sum + zone.trend30d, 0) / waterZones.length : 0;

  return (
    <main className="min-h-screen">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted">{UI_TEXT.demoDataset}</p>
            <h1 className="text-2xl font-semibold tracking-normal text-ink">{UI_TEXT.overviewTitle}</h1>
            <p className="max-w-3xl text-sm text-muted">{UI_TEXT.subtitle}</p>
          </div>
          <ReportButton />
        </div>
      </section>

      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-3 text-sm">
          {[
            "Oversikt",
            "Vannsoner og vanntap",
            "Lekkasjekontroll",
            "Fremmedvann",
            "Private stikkledninger",
            "Feltoppgaver",
            "Rapport",
            "Datagrunnlag"
          ].map((item) => (
            <a
              key={item}
              href={`#${getNavTarget(item)}`}
              className="shrink-0 border border-slate-200 bg-white px-3 py-2 text-muted hover:border-slate-400 hover:text-ink"
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      <section id="oversikt" className="mx-auto max-w-7xl scroll-mt-20 px-6 pt-6">
        <article className="border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-ink">Velkommen til VA Drift Insight</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
            Jeg har laget denne demoen for å vise hvordan praktisk VVS-/VA-erfaring kan kombineres med backend,
            kart, databaser og rapportering for å støtte lekkasjekontroll, vanntapsreduksjon og datadrevet
            feltoppfølging.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
            Målet er ikke å erstatte eksisterende driftskontrollsystemer eller faglige vurderinger, men å vise hvordan
            data fra ledningsnett, vannsoner, vannmålere, private stikkledninger, hendelser og nedbør kan brukes til
            bedre prioritering i felt.
          </p>
          <ol className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm md:grid-cols-5">
            {[
              ["1", "Datagrunnlag", "Import og validering"],
              ["2", "Analyse", "Vannsoner og risiko"],
              ["3", "Forklaring", "Årsak og tillit"],
              ["4", "Feltoppfølging", "Metode og status"],
              ["5", "Rapport", "Sammendrag for møte"]
            ].map(([step, title, description]) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-slate-300 text-xs font-semibold text-ink">
                  {step}
                </span>
                <span>
                  <span className="block font-semibold text-ink">{title}</span>
                  <span className="block text-muted">{description}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm font-medium text-ink">Beslutningsstøtte, ikke automatisk diagnose.</p>
        </article>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-6 md:grid-cols-5">
        <KpiCard
          label="Estimert vanntap"
          value={`${estimatedWaterLoss.toFixed(1)} m³/d`}
          tone="high"
          helper="Sum beregnet fra nattforbruk mot baseline."
        />
        <KpiCard
          label="Nattforbruk trend"
          value={`${averageTrend30d >= 0 ? "+" : ""}${averageTrend30d.toFixed(1)} %`}
          tone={averageTrend30d >= 10 ? "high" : averageTrend30d >= 5 ? "medium" : "neutral"}
          helper="Gjennomsnittlig 30-dagers trend for vannsoner."
        />
        <KpiCard
          label="Høyrisiko vannsoner"
          value={highWaterZones}
          tone="high"
          helper="Soner der nattforbruk ligger over terskel."
        />
        <KpiCard
          label="Private lekkasjesaker"
          value={activePrivateCases}
          helper="Åpne saker knyttet til private stikkledninger."
        />
        <KpiCard
          label="Åpne feltoppgaver"
          value={openFieldTasks}
          tone={openFieldTasks > 3 ? "medium" : "neutral"}
          helper="Planlagt eller pågående arbeid i felt."
        />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6">
        <WaterZonesTable waterZones={waterZones} />
      </section>

      <section id="lekkasjekontroll" className="mx-auto grid max-w-7xl scroll-mt-20 gap-6 px-6 pb-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <RiskMap
          features={mapAssets.features}
          contextFeatures={mapContext.features}
          selectedId={selectedAssetId}
          onSelectAsset={handleSelectAsset}
        />
        <LeakageDetailsPanel
          zones={leakageZones}
          selectedZoneId={selectedZoneId}
          analysis={leakageAnalysis}
          isLoading={loadingLeakage}
          error={leakageError}
          onSelectZone={(zoneId) => {
            setSelectedAssetId(zoneId);
            setSelectedZoneId(zoneId);
          }}
        />
      </section>

      <section id="fremmedvann" className="mx-auto max-w-7xl scroll-mt-20 px-6 pb-6">
        <PumpStationChart
          pumpStations={pumpStations}
          rainfall={rainfall}
          selectedPumpStationId={selectedPumpStationId}
          analysis={pumpStationAnalysis}
          isLoading={loadingPumpStation}
          error={pumpStationError}
          onSelectPumpStation={(pumpStationId) => {
            setSelectedAssetId(pumpStationId);
            setSelectedPumpStationId(pumpStationId);
          }}
        />
      </section>

      <section id="private-stikkledninger" className="mx-auto max-w-7xl scroll-mt-20 px-6 pb-6">
        <PrivateCasesTable initialPrivateCases={privateCases} />
      </section>

      <section id="feltoppgaver" className="mx-auto max-w-7xl scroll-mt-20 space-y-6 px-6 pb-8">
        <FieldTasksTable initialFieldTasks={fieldTasks} />
        <RecommendationsTable initialRecommendations={recommendations} />
      </section>

      <section id="rapport" className="mx-auto max-w-7xl scroll-mt-20 space-y-4 px-6 pb-8">
        <div className="flex flex-col gap-3 border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">Rapport</h2>
            <p className="mt-1 text-sm text-muted">
              Generer en demo-rapport og bruk månedsoppsummeringen som kort beslutningsgrunnlag.
            </p>
          </div>
          <ReportButton />
        </div>
        <MonthlyReportCard report={monthlyReport} />
      </section>

      <section id="datagrunnlag" className="mx-auto max-w-7xl scroll-mt-20 space-y-6 px-6 pb-8">
        <DataQualityOverview importRuns={importRuns} waterZones={waterZones} privateCases={privateCases} />
        <DataSourcesCard />
        <DataImportPanel initialImportRuns={importRuns} />
      </section>
    </main>
  );
}

function getNavTarget(item: string) {
  const targets: Record<string, string> = {
    Oversikt: "oversikt",
    "Vannsoner og vanntap": "vannsoner",
    Lekkasjekontroll: "lekkasjekontroll",
    Fremmedvann: "fremmedvann",
    "Private stikkledninger": "private-stikkledninger",
    Feltoppgaver: "feltoppgaver",
    Rapport: "rapport",
    Datagrunnlag: "datagrunnlag"
  };

  return targets[item] ?? "oversikt";
}
