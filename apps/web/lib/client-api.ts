import type { LeakageZoneAnalysis, PumpStationAnalysis, RecommendationStatus, RecommendationSummary } from "./api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const DEMO_API_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? "local-demo-key";

export async function fetchLeakageZoneAnalysis(zoneId: string): Promise<LeakageZoneAnalysis> {
  return getJson<LeakageZoneAnalysis>(`/api/leakage/zones/${zoneId}`);
}

export async function fetchPumpStationAnalysis(pumpStationId: string): Promise<PumpStationAnalysis> {
  return getJson<PumpStationAnalysis>(`/api/fremmedvann/pump-stations/${pumpStationId}/analysis`);
}

export async function updateRecommendationStatus(
  recommendationId: string,
  status: RecommendationStatus
): Promise<RecommendationSummary> {
  const response = await fetch(`${API_URL}/api/recommendations/${recommendationId}/status`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "x-demo-api-key": DEMO_API_KEY
    },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw new Error("Kunne ikke oppdatere status.");
  }

  return response.json() as Promise<RecommendationSummary>;
}

export async function generateVaRiskReport(): Promise<{
  id: string;
  fileName: string;
  downloadUrl: string;
  generatedAt: string;
}> {
  const response = await fetch(`${API_URL}/api/reports/va-risk`, {
    method: "POST",
    headers: {
      "x-demo-api-key": DEMO_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error("Kunne ikke generere rapport.");
  }

  return response.json() as Promise<{
    id: string;
    fileName: string;
    downloadUrl: string;
    generatedAt: string;
  }>;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error("Kunne ikke hente data.");
  }

  return response.json() as Promise<T>;
}
