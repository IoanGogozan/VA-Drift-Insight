import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import {
  getLeakageZoneAnalysis,
  getLeakageZones,
  getMapAssets,
  getMapContext,
  getOverview,
  getPumpStationAnalysis,
  getPumpStations,
  getRainfall,
  getRecommendations
} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [overview, mapAssets, mapContext, rainfall, leakageZones, pumpStations, recommendations] = await Promise.all([
    getOverview(),
    getMapAssets(),
    getMapContext(),
    getRainfall(),
    getLeakageZones(),
    getPumpStations(),
    getRecommendations()
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
      pumpStations={pumpStations}
      recommendations={recommendations}
      initialLeakageAnalysis={initialLeakageAnalysis}
      initialPumpStationAnalysis={initialPumpStationAnalysis}
    />
  );
}
