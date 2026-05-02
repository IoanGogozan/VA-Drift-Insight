"use client";

import { useEffect, useState } from "react";
import type {
  LeakageZoneAnalysis,
  LeakageZoneSummary,
  MapAssetFeature,
  MapAssetsResponse,
  MapContextResponse,
  OverviewResponse,
  PumpStationAnalysis,
  PumpStationSummary,
  RainfallResponse,
  RecommendationSummary
} from "@/lib/api";
import { fetchLeakageZoneAnalysis, fetchPumpStationAnalysis } from "@/lib/client-api";
import { UI_TEXT } from "@/lib/ui-text";
import { PumpStationChart } from "../fremmedvann/pump-station-chart";
import { LeakageDetailsPanel } from "../leakage/leakage-details-panel";
import { RiskMap } from "../map/risk-map";
import { DataSourcesCard } from "../overview/data-sources-card";
import { KpiCard } from "../overview/kpi-card";
import { RecommendationsTable } from "../recommendations/recommendations-table";
import { ReportButton } from "../reports/report-button";

type DashboardScreenProps = {
  overview: OverviewResponse;
  mapAssets: MapAssetsResponse;
  mapContext: MapContextResponse;
  rainfall: RainfallResponse;
  leakageZones: LeakageZoneSummary[];
  pumpStations: PumpStationSummary[];
  recommendations: RecommendationSummary[];
  initialLeakageAnalysis: LeakageZoneAnalysis | null;
  initialPumpStationAnalysis: PumpStationAnalysis | null;
};

export function DashboardScreen({
  overview,
  mapAssets,
  mapContext,
  rainfall,
  leakageZones,
  pumpStations,
  recommendations,
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

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-6 md:grid-cols-5">
        <KpiCard label={UI_TEXT.highRiskLeakageZones} value={overview.kpis.highRiskLeakageZones} tone="high" />
        <KpiCard label={UI_TEXT.fremmedvannSuspicions} value={overview.kpis.fremmedvannSuspicions} tone="medium" />
        <KpiCard label={UI_TEXT.activeAnomalies} value={overview.kpis.activeAnomalies} />
        <KpiCard label={UI_TEXT.recommendedFieldChecks} value={overview.kpis.recommendedFieldChecks} />
        <KpiCard label={UI_TEXT.dataQuality} value={`${overview.kpis.dataCompletenessScore}%`} />
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

      <section className="mx-auto max-w-7xl px-6 pb-6">
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

      <section className="mx-auto max-w-7xl px-6 pb-8">
        <RecommendationsTable initialRecommendations={recommendations} />
      </section>
    </main>
  );
}
