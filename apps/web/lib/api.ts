import "server-only";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type OverviewResponse = {
  kpis: {
    highRiskLeakageZones: number;
    fremmedvannSuspicions: number;
    activeAnomalies: number;
    recommendedFieldChecks: number;
    dataCompletenessScore: number;
  };
  topRecommendations: RecommendationSummary[];
};

export type RecommendationSummary = {
  id: string;
  type: RecommendationType;
  priority: "high" | "medium" | "low";
  assetType: string;
  assetId: string;
  areaName: string;
  reason: string;
  suggestedAction: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type RecommendationType = "leakage" | "fremmedvann" | "sanering" | "data_gap";
export type RecommendationStatus = "new" | "planned" | "in_progress" | "completed" | "dismissed";

export type MapAssetFeature = {
  type: "Feature";
  id: string;
  geometry:
    | { type: "Point"; coordinates: [number, number] }
    | { type: "LineString"; coordinates: [number, number][] }
    | { type: "Polygon"; coordinates: [number, number][][] };
  properties: {
    assetType: "zone" | "pipe" | "pump_station" | "incident";
    name: string;
    subtype: string;
    riskScore: number | null;
  };
};

export type MapAssetsResponse = {
  type: "FeatureCollection";
  features: MapAssetFeature[];
};

export type MapContextFeature = {
  type: "Feature";
  id: string;
  geometry: { type: "MultiPolygon"; coordinates: [number, number][][][] };
  properties: {
    assetType: "municipality";
    municipalityCode: string;
    name: string;
    source: string;
  };
};

export type MapContextResponse = {
  type: "FeatureCollection";
  features: MapContextFeature[];
};

export type RainfallResponse = {
  municipalityCode: string;
  from: string;
  to: string;
  source: string;
  observations: RainfallObservation[];
};

export type RainfallObservation = {
  id: string;
  stationId: string;
  stationName: string | null;
  observedAt: string;
  rainfallMm: number | null;
  temperatureC: number | null;
  qualityCode: string | null;
};

export type LeakageZoneSummary = {
  zoneId: string;
  name: string;
  riskScore: number;
  confidence: number;
  pipeCount: number;
  dataQualityScore: number | null;
  explanation: string;
};

export type LeakageZoneAnalysis = LeakageZoneSummary & {
  factors: Record<string, number>;
  recommendedAction: string;
  decisionSupportNote: string;
  recentIncidents: IncidentSummary[];
};

export type PumpStationSummary = {
  pumpStationId: string;
  stationCode: string;
  name: string;
  catchmentName: string | null;
  suspicionScore: number;
  suspicionLevel: string;
  confidence: number;
  alarmCount: number;
  overflowEvents: number;
  explanation: string;
};

export type PumpStationAnalysis = PumpStationSummary & {
  factors: Record<string, number>;
  recommendedAction: string;
  chartData: PumpStationChartPoint[];
  recentIncidents: IncidentSummary[];
};

export type PumpStationChartPoint = {
  timestamp: string;
  rainfallMm: number;
  pumpRuntimeMinutes: number;
  flowM3h: number;
  levelM: number;
};

export type IncidentSummary = {
  id: string;
  type: string;
  occurredAt: string;
  description: string;
};

export async function getOverview(): Promise<OverviewResponse> {
  const response = await fetch(`${API_URL}/api/overview`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Kunne ikke laste risikodata.");
  }

  return response.json() as Promise<OverviewResponse>;
}

export async function getMapAssets(): Promise<MapAssetsResponse> {
  return getJson<MapAssetsResponse>("/api/map/assets");
}

export async function getMapContext(): Promise<MapContextResponse> {
  return getJson<MapContextResponse>("/api/map/context");
}

export async function getRainfall(): Promise<RainfallResponse> {
  return getJson<RainfallResponse>("/api/weather/rainfall");
}

export async function getLeakageZones(): Promise<LeakageZoneSummary[]> {
  return getJson<LeakageZoneSummary[]>("/api/leakage/zones");
}

export async function getLeakageZoneAnalysis(zoneId: string): Promise<LeakageZoneAnalysis> {
  return getJson<LeakageZoneAnalysis>(`/api/leakage/zones/${zoneId}`);
}

export async function getPumpStations(): Promise<PumpStationSummary[]> {
  return getJson<PumpStationSummary[]>("/api/fremmedvann/pump-stations");
}

export async function getPumpStationAnalysis(pumpStationId: string): Promise<PumpStationAnalysis> {
  return getJson<PumpStationAnalysis>(`/api/fremmedvann/pump-stations/${pumpStationId}/analysis`);
}

export async function getRecommendations(): Promise<RecommendationSummary[]> {
  return getJson<RecommendationSummary[]>("/api/recommendations");
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Kunne ikke laste data.");
  }

  return response.json() as Promise<T>;
}
