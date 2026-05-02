import { Injectable, NotFoundException } from "@nestjs/common";
import { calculateFremmedvannRisk, getFremmedvannSuspicionLevel } from "@va-drift-insight/shared";
import { PumpStation, RiskScore } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class FremmedvannService {
  constructor(private readonly prisma: PrismaService) {}

  async getPumpStations() {
    const pumpStations = await this.prisma.pumpStation.findMany({
      include: { catchment: true },
      orderBy: { stationCode: "asc" }
    });
    const scores = await this.getScores(pumpStations.map((pumpStation) => pumpStation.id));

    return pumpStations.map((pumpStation) => {
      const score = scores.get(pumpStation.id);
      const calculated = calculateFremmedvannRisk(toFremmedvannInput(pumpStation));

      return {
        pumpStationId: pumpStation.id,
        stationCode: pumpStation.stationCode,
        name: pumpStation.name,
        catchmentName: pumpStation.catchment?.name ?? null,
        suspicionScore: score?.score ?? calculated.score,
        suspicionLevel: getFremmedvannSuspicionLevel(score?.score ?? calculated.score),
        confidence: score?.confidence ?? calculated.confidence,
        alarmCount: pumpStation.alarmCount,
        overflowEvents: pumpStation.overflowEvents,
        explanation: score?.explanation ?? calculated.explanation
      };
    });
  }

  async getPumpStationAnalysis(id: string) {
    const pumpStation = await this.prisma.pumpStation.findUnique({
      where: { id },
      include: { catchment: true }
    });

    if (!pumpStation) {
      throw new NotFoundException("Pump station was not found.");
    }

    const [score, recommendation, incidents] = await Promise.all([
      this.prisma.riskScore.findFirst({
        where: { assetType: "pump_station", assetId: id, scoreType: "fremmedvann" },
        orderBy: { calculatedAt: "desc" }
      }),
      this.prisma.recommendation.findFirst({
        where: { type: "fremmedvann", assetType: "pump_station", assetId: id },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.incident.findMany({
        where: { assetType: "pump_station", assetId: id },
        orderBy: { occurredAt: "desc" },
        take: 5
      })
    ]);
    const calculated = calculateFremmedvannRisk(toFremmedvannInput(pumpStation));
    const suspicionScore = score?.score ?? calculated.score;

    return {
      pumpStationId: pumpStation.id,
      stationCode: pumpStation.stationCode,
      name: pumpStation.name,
      catchmentName: pumpStation.catchment?.name ?? null,
      suspicionScore,
      suspicionLevel: getFremmedvannSuspicionLevel(suspicionScore),
      confidence: score?.confidence ?? calculated.confidence,
      factors: calculated.factors,
      explanation: score?.explanation ?? calculated.explanation,
      recommendedAction:
        recommendation?.suggestedAction ??
        "Inspiser oppstrøms kummer og vurder midlertidig flowmåler.",
      chartData: createDemoRainfallResponse(pumpStation),
      recentIncidents: incidents.map((incident) => ({
        id: incident.id,
        type: incident.incidentType,
        occurredAt: incident.occurredAt,
        description: incident.description
      }))
    };
  }

  private async getScores(pumpStationIds: string[]) {
    const scores = await this.prisma.riskScore.findMany({
      where: {
        assetType: "pump_station",
        assetId: { in: pumpStationIds },
        scoreType: "fremmedvann"
      }
    });

    return new Map<string, RiskScore>(scores.map((score) => [score.assetId, score]));
  }
}

function createDemoRainfallResponse(pumpStation: PumpStation) {
  const highResponse = pumpStation.alarmCount >= 5;
  const baseRuntime = highResponse ? 24 : 16;

  return Array.from({ length: 24 }, (_, hour) => {
    const rainfallMm = hour >= 4 && hour <= 7 ? (hour === 5 ? 8 : 4) : 0;
    const delayedResponse = highResponse && hour >= 8 && hour <= 17;
    const pumpRuntimeMinutes = baseRuntime + (delayedResponse ? 22 : rainfallMm > 0 ? 8 : 0);
    const flowM3h = 42 + (delayedResponse ? 28 : rainfallMm > 0 ? 10 : 0);

    return {
      timestamp: `2026-04-20T${hour.toString().padStart(2, "0")}:00:00.000Z`,
      rainfallMm,
      pumpRuntimeMinutes,
      flowM3h,
      levelM: Number((1.2 + (delayedResponse ? 0.45 : rainfallMm > 0 ? 0.2 : 0)).toFixed(2))
    };
  });
}

function toFremmedvannInput(pumpStation: PumpStation) {
  return {
    alarmCount: pumpStation.alarmCount,
    overflowEvents: pumpStation.overflowEvents,
    rainfallDataAvailable: true
  };
}
