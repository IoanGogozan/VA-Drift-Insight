import { Injectable, NotFoundException } from "@nestjs/common";
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
      const calculated = this.calculateFremmedvannScore(pumpStation);

      return {
        pumpStationId: pumpStation.id,
        stationCode: pumpStation.stationCode,
        name: pumpStation.name,
        catchmentName: pumpStation.catchment?.name ?? null,
        suspicionScore: score?.score ?? calculated.score,
        suspicionLevel: getSuspicionLevel(score?.score ?? calculated.score),
        confidence: score?.confidence ?? calculated.confidence,
        alarmCount: pumpStation.alarmCount,
        overflowEvents: pumpStation.overflowEvents,
        explanation: score?.explanation ?? this.createExplanation(pumpStation)
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
    const calculated = this.calculateFremmedvannScore(pumpStation);
    const suspicionScore = score?.score ?? calculated.score;

    return {
      pumpStationId: pumpStation.id,
      stationCode: pumpStation.stationCode,
      name: pumpStation.name,
      catchmentName: pumpStation.catchment?.name ?? null,
      suspicionScore,
      suspicionLevel: getSuspicionLevel(suspicionScore),
      confidence: score?.confidence ?? calculated.confidence,
      factors: calculated.factors,
      explanation: score?.explanation ?? this.createExplanation(pumpStation),
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

  private calculateFremmedvannScore(pumpStation: PumpStation) {
    const factors = {
      rainfallCorrelation: pumpStation.alarmCount >= 5 ? 85 : pumpStation.alarmCount >= 2 ? 60 : 25,
      pumpRuntimeIncrease: pumpStation.alarmCount >= 5 ? 80 : 45,
      delayedFlowResponse: pumpStation.overflowEvents > 0 ? 75 : 35,
      overflowEvents: clamp(pumpStation.overflowEvents * 40),
      highLevelAlarms: clamp(pumpStation.alarmCount * 12)
    };
    const score = Math.round(
      factors.rainfallCorrelation * 0.35 +
        factors.pumpRuntimeIncrease * 0.25 +
        factors.delayedFlowResponse * 0.2 +
        factors.overflowEvents * 0.1 +
        factors.highLevelAlarms * 0.1
    );

    return {
      score,
      confidence: pumpStation.alarmCount > 0 ? 74 : 58,
      factors
    };
  }

  private createExplanation(pumpStation: PumpStation) {
    if (pumpStation.alarmCount >= 5 || pumpStation.overflowEvents > 0) {
      return "Pumpestasjonen har gjentatte våtværsrelaterte alarmer og overløpshendelser som gir mistanke om fremmedvann.";
    }

    return "Pumpestasjonen har begrensede indikasjoner på regnrelatert respons i demo-datasettet.";
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

function getSuspicionLevel(score: number) {
  if (score >= 75) return "Høy";
  if (score >= 50) return "Medium";
  return "Lav";
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
