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
import { LeakageDetailsPanel } from "../leakage/leakage-details-panel";
import { RiskMap } from "../map/risk-map";
import { DataSourcesCard } from "../overview/data-sources-card";
import { KpiCard } from "../overview/kpi-card";
import { PrivateCasesTable } from "../private-cases/private-cases-table";
import { RecommendationsTable } from "../recommendations/recommendations-table";
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
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 pb-4 text-sm">
          {["Oversikt", "Lekkasjekontroll", "Fremmedvann", "Tiltak", "Rapporter", "Datagrunnlag"].map((item) => (
            <a
              key={item}
              href={`#${getNavTarget(item)}`}
              className="border border-slate-200 px-3 py-2 text-muted hover:border-slate-400 hover:text-ink"
            >
              {item}
            </a>
          ))}
        </nav>
      </section>

      <section id="oversikt" className="mx-auto max-w-7xl px-6 pt-6">
        <article className="border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-ink">Velkommen til VA Drift Insight</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
            Dette er en demoapplikasjon som viser hvordan kommunale VA-data kan brukes til praktisk beslutningsstøtte
            for lekkasjekontroll, vanntap og fremmedvann. Målet er ikke å erstatte eksisterende
            driftskontrollsystemer, men å vise hvordan data fra ledningsnett, målesoner, pumpestasjoner og nedbør kan
            kombineres for å gi bedre grunnlag for prioritering i felt.
          </p>
          <p className="mt-3 text-sm font-medium text-ink">Beslutningsstøtte, ikke automatisk diagnose.</p>
        </article>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-6 md:grid-cols-5">
        <KpiCard label="Estimert vanntap" value={`${estimatedWaterLoss.toFixed(1)} m³/d`} tone="high" />
        <KpiCard label="Høyrisiko vannsoner" value={highWaterZones} tone="high" />
        <KpiCard label={UI_TEXT.fremmedvannSuspicions} value={overview.kpis.fremmedvannSuspicions} tone="medium" />
        <KpiCard
          label="Private lekkasjesaker"
          value={privateCases.filter((item) => item.status !== "closed").length}
        />
        <KpiCard label={UI_TEXT.recommendedFieldChecks} value={overview.kpis.recommendedFieldChecks} />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6">
        <WaterZonesTable waterZones={waterZones} />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6">
        <PrivateCasesTable initialPrivateCases={privateCases} />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6">
        <FieldTasksTable initialFieldTasks={fieldTasks} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-6 lg:grid-cols-[minmax(0,1fr)_390px]">
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

      <section id="datagrunnlag" className="mx-auto max-w-7xl px-6 pb-6">
        <DataImportPanel initialImportRuns={importRuns} />
      </section>

      <section id="fremmedvann" className="mx-auto max-w-7xl px-6 pb-6">
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

      <section className="mx-auto max-w-7xl px-6 pb-8">
        <DataSourcesCard />
      </section>

      <section id="tiltak" className="mx-auto max-w-7xl px-6 pb-8">
        <RecommendationsTable initialRecommendations={recommendations} />
      </section>

      <section id="rapporter" className="mx-auto max-w-7xl px-6 pb-8">
        <div className="border border-slate-200 bg-white p-5 text-sm text-muted">
          Bruk rapportknappen øverst for å generere VA-risikorapport fra gjeldende demo-datasett.
        </div>
      </section>
    </main>
  );
}

function getNavTarget(item: string) {
  const targets: Record<string, string> = {
    Oversikt: "oversikt",
    Lekkasjekontroll: "lekkasjekontroll",
    Fremmedvann: "fremmedvann",
    Tiltak: "tiltak",
    Rapporter: "rapporter",
    Datagrunnlag: "datagrunnlag"
  };

  return targets[item] ?? "oversikt";
}
