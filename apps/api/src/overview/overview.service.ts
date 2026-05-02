import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class OverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      highRiskLeakageZones,
      fremmedvannSuspicions,
      activeAnomalies,
      recommendedFieldChecks,
      dataQuality,
      topRecommendations
    ] = await Promise.all([
      this.prisma.riskScore.count({
        where: {
          scoreType: "leakage",
          assetType: "zone",
          score: { gte: 75 }
        }
      }),
      this.prisma.riskScore.count({
        where: {
          scoreType: "fremmedvann",
          assetType: "pump_station",
          score: { gte: 70 }
        }
      }),
      this.prisma.incident.count({
        where: {
          resolvedAt: null
        }
      }),
      this.prisma.recommendation.count({
        where: {
          status: { in: ["new", "planned"] }
        }
      }),
      this.prisma.zone.aggregate({
        _avg: {
          dataQualityScore: true
        }
      }),
      this.prisma.recommendation.findMany({
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        take: 5
      })
    ]);

    return {
      kpis: {
        highRiskLeakageZones,
        fremmedvannSuspicions,
        activeAnomalies,
        recommendedFieldChecks,
        dataCompletenessScore: Math.round(dataQuality._avg.dataQualityScore ?? 0)
      },
      topRecommendations
    };
  }
}
