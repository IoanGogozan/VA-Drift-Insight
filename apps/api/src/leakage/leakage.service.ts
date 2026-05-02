import { Injectable, NotFoundException } from "@nestjs/common";
import { Pipe, RiskScore, Zone } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

type ZoneWithPipes = Zone & { pipes: Pipe[] };

@Injectable()
export class LeakageService {
  constructor(private readonly prisma: PrismaService) {}

  async getZones() {
    const zones = await this.prisma.zone.findMany({
      where: { zoneType: "water_meter_zone" },
      include: { pipes: true },
      orderBy: { name: "asc" }
    });
    const scores = await this.getScoresForZones(zones.map((zone) => zone.id));

    return zones.map((zone) => {
      const score = scores.get(zone.id);

      return {
        zoneId: zone.id,
        name: zone.name,
        riskScore: score?.score ?? this.calculateLeakageScore(zone).score,
        confidence: score?.confidence ?? this.calculateConfidence(zone),
        pipeCount: zone.pipes.length,
        dataQualityScore: zone.dataQualityScore,
        explanation: score?.explanation ?? this.createLeakageExplanation(zone)
      };
    });
  }

  async getZoneAnalysis(id: string) {
    const zone = await this.prisma.zone.findFirst({
      where: { id, zoneType: "water_meter_zone" },
      include: { pipes: true }
    });

    if (!zone) {
      throw new NotFoundException("Leakage zone was not found.");
    }

    const [score, recommendation, recentIncidents] = await Promise.all([
      this.prisma.riskScore.findFirst({
        where: { assetType: "zone", assetId: id, scoreType: "leakage" },
        orderBy: { calculatedAt: "desc" }
      }),
      this.prisma.recommendation.findFirst({
        where: { type: "leakage", assetType: "zone", assetId: id },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.incident.findMany({
        where: { assetType: "zone", assetId: id },
        orderBy: { occurredAt: "desc" },
        take: 5
      })
    ]);

    const calculated = this.calculateLeakageScore(zone);

    return {
      zoneId: zone.id,
      name: zone.name,
      riskScore: score?.score ?? calculated.score,
      confidence: score?.confidence ?? this.calculateConfidence(zone),
      factors: calculated.factors,
      explanation: score?.explanation ?? this.createLeakageExplanation(zone),
      recommendedAction:
        recommendation?.suggestedAction ??
        "Vurder målrettet lekkasjesøk og kontroll av ventiler i sonen.",
      decisionSupportNote: "Beslutningsstøtte, ikke automatisk diagnose.",
      recentIncidents: recentIncidents.map((incident) => ({
        id: incident.id,
        type: incident.incidentType,
        occurredAt: incident.occurredAt,
        description: incident.description
      }))
    };
  }

  private async getScoresForZones(zoneIds: string[]) {
    const scores = await this.prisma.riskScore.findMany({
      where: { assetType: "zone", assetId: { in: zoneIds }, scoreType: "leakage" }
    });

    return new Map<string, RiskScore>(scores.map((score) => [score.assetId, score]));
  }

  private calculateLeakageScore(zone: ZoneWithPipes) {
    const factors = {
      pipeAge: average(zone.pipes.map((pipe) => getPipeAgeScore(pipe.installedYear))),
      material: average(zone.pipes.map((pipe) => getMaterialScore(pipe.material))),
      historicalBreaks: clamp(average(zone.pipes.map((pipe) => pipe.previousBreaks * 40))),
      nightFlowAnomaly: getNightFlowAnomalyScore(zone.baselineNightFlow, zone.currentNightFlow),
      pressureVariation: 60,
      criticality: average(zone.pipes.map((pipe) => pipe.criticality))
    };
    const score = Math.round(
      factors.pipeAge * 0.25 +
        factors.material * 0.2 +
        factors.historicalBreaks * 0.2 +
        factors.nightFlowAnomaly * 0.2 +
        factors.pressureVariation * 0.1 +
        factors.criticality * 0.05
    );

    return { score, factors };
  }

  private calculateConfidence(zone: ZoneWithPipes) {
    const missingInstalledYears = zone.pipes.filter((pipe) => !pipe.installedYear).length;
    const missingPenalty = zone.pipes.length === 0 ? 30 : (missingInstalledYears / zone.pipes.length) * 25;

    return Math.round(clamp((zone.dataQualityScore ?? 70) - missingPenalty));
  }

  private createLeakageExplanation(zone: ZoneWithPipes) {
    const anomaly = getNightFlowIncreasePercent(zone.baselineNightFlow, zone.currentNightFlow);
    const oldPipeCount = zone.pipes.filter((pipe) => {
      if (!pipe.installedYear) {
        return false;
      }

      return new Date().getFullYear() - pipe.installedYear > 45;
    }).length;
    const previousBreaks = zone.pipes.reduce((sum, pipe) => sum + pipe.previousBreaks, 0);

    return `Risikoen vurderes ut fra ${Math.round(anomaly)} % økning i nattforbruk, ${oldPipeCount} eldre ledninger og ${previousBreaks} tidligere hendelser i sonen.`;
  }
}

function getPipeAgeScore(installedYear: number | null) {
  if (!installedYear) {
    return 60;
  }

  const age = new Date().getFullYear() - installedYear;

  if (age <= 10) return 10;
  if (age <= 25) return 30;
  if (age <= 40) return 55;
  if (age <= 60) return 80;
  return 95;
}

function getMaterialScore(material: string) {
  const normalized = material.toLowerCase();

  if (normalized === "pe") return 25;
  if (normalized === "pvc") return 40;
  if (normalized.includes("duktilt")) return 55;
  if (normalized.includes("støpejern")) return 75;
  if (normalized.includes("betong")) return 65;
  if (normalized.includes("eternitt") || normalized.includes("asbest")) return 80;
  return 55;
}

function getNightFlowAnomalyScore(baseline: number | null, current: number | null) {
  return clamp(getNightFlowIncreasePercent(baseline, current) * 5);
}

function getNightFlowIncreasePercent(baseline: number | null, current: number | null) {
  if (!baseline || !current || baseline <= 0) {
    return 0;
  }

  return Math.max(0, ((current - baseline) / baseline) * 100);
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
