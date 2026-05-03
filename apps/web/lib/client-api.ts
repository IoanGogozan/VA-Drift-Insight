import type {
  FieldTaskStatus,
  FieldTaskSummary,
  ImportRunSummary,
  LeakageZoneAnalysis,
  PrivateServiceCaseStatus,
  PrivateServiceCaseSummary,
  PumpStationAnalysis,
  RecommendationStatus,
  RecommendationSummary
} from "./api";

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

export async function updatePrivateCaseStatus(
  privateCaseId: string,
  status: PrivateServiceCaseStatus
): Promise<PrivateServiceCaseSummary> {
  const response = await fetch(`${API_URL}/api/private-cases/${privateCaseId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "x-demo-api-key": DEMO_API_KEY
    },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw new Error("Kunne ikke oppdatere privat lekkasjesak.");
  }

  return response.json() as Promise<PrivateServiceCaseSummary>;
}

export async function updateFieldTaskStatus(fieldTaskId: string, status: FieldTaskStatus): Promise<FieldTaskSummary> {
  const response = await fetch(`${API_URL}/api/field-tasks/${fieldTaskId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "x-demo-api-key": DEMO_API_KEY
    },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw new Error("Kunne ikke oppdatere feltoppgave.");
  }

  return response.json() as Promise<FieldTaskSummary>;
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

export async function runDemoDatasetImport(): Promise<ImportRunSummary> {
  const response = await fetch(`${API_URL}/api/import/demo-dataset`, {
    method: "POST",
    headers: {
      "x-demo-api-key": DEMO_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error("Kunne ikke kjøre dataimport.");
  }

  return response.json() as Promise<ImportRunSummary>;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error("Kunne ikke hente data.");
  }

  return response.json() as Promise<T>;
}
