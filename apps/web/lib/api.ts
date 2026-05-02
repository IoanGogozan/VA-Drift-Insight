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
  type: string;
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

export async function getOverview(): Promise<OverviewResponse> {
  const response = await fetch(`${API_URL}/api/overview`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Kunne ikke laste risikodata.");
  }

  return response.json() as Promise<OverviewResponse>;
}
