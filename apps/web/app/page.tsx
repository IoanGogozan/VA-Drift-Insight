import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import {
  getLeakageZoneAnalysis,
  getLeakageZones,
  getMapAssets,
  getOverview,
  getPumpStationAnalysis,
  getPumpStations,
  getRecommendations
} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [overview, mapAssets, leakageZones, pumpStations, recommendations] = await Promise.all([
    getOverview(),
    getMapAssets(),
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
      leakageZones={leakageZones}
      pumpStations={pumpStations}
      recommendations={recommendations}
      initialLeakageAnalysis={initialLeakageAnalysis}
      initialPumpStationAnalysis={initialPumpStationAnalysis}
    />
  );
}
