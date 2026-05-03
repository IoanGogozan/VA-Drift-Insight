import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import {
  getFieldTasks,
  getLeakageZoneAnalysis,
  getLeakageZones,
  getImportRuns,
  getMapAssets,
  getMapContext,
  getMonthlyReport,
  getOverview,
  getPrivateCases,
  getPumpStationAnalysis,
  getPumpStations,
  getRainfall,
  getRecommendations,
  getWaterZones
} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
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
    monthlyReport
  ] = await Promise.all([
    getOverview(),
    getMapAssets(),
    getMapContext(),
    getRainfall(),
    getLeakageZones(),
    getWaterZones(),
    getPrivateCases(),
    getFieldTasks(),
    getPumpStations(),
    getRecommendations(),
    getImportRuns(),
    getMonthlyReport()
  ]);
  const [initialLeakageAnalysis, initialPumpStationAnalysis] = await Promise.all([
    leakageZones[0] ? getLeakageZoneAnalysis(leakageZones[0].zoneId) : Promise.resolve(null),
    pumpStations[0] ? getPumpStationAnalysis(pumpStations[0].pumpStationId) : Promise.resolve(null)
  ]);

  return (
    <DashboardScreen
      overview={overview}
      mapAssets={mapAssets}
      mapContext={mapContext}
      rainfall={rainfall}
      leakageZones={leakageZones}
      waterZones={waterZones}
      privateCases={privateCases}
      fieldTasks={fieldTasks}
      pumpStations={pumpStations}
      recommendations={recommendations}
      importRuns={importRuns}
      monthlyReport={monthlyReport}
      initialLeakageAnalysis={initialLeakageAnalysis}
      initialPumpStationAnalysis={initialPumpStationAnalysis}
    />
  );
}
