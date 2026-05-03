import { Injectable, NotFoundException } from "@nestjs/common";
import { calculateLeakageRisk } from "@va-drift-insight/shared";
import { FieldTaskMethod, Pipe, RiskScore, Zone } from "@prisma/client";
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
      const calculated = calculateLeakageRisk(toLeakageInput(zone));

      return {
        zoneId: zone.id,
        name: zone.name,
        riskScore: score?.score ?? calculated.score,
        confidence: score?.confidence ?? calculated.confidence,
        pipeCount: zone.pipes.length,
        dataQualityScore: zone.dataQualityScore,
        explanation: score?.explanation ?? calculated.explanation
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

    const [
      score,
      recommendation,
      recentIncidents,
      previousLeaks,
      customerComplaints,
      waterZone,
      privateCasesOpen,
      fieldTask
    ] = await Promise.all([
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
      }),
      this.prisma.incident.count({
        where: {
          assetType: "zone",
          assetId: id,
          incidentType: { in: ["leak", "pipe_break"] }
        }
      }),
      this.prisma.incident.count({
        where: {
          assetType: "zone",
          assetId: id,
          incidentType: "complaint"
        }
      }),
      this.prisma.waterZone.findUnique({
        where: { zoneId: id },
        select: { estimatedLossM3Day: true, trend7d: true, trend30d: true, status: true }
      }),
      this.prisma.privateServiceCase.count({
        where: {
          zoneId: id,
          status: { not: "closed" }
        }
      }),
      this.prisma.fieldTask.findFirst({
        where: {
          zoneId: id,
          type: "leakage_control",
          status: { not: "cancelled" }
        },
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        select: { suggestedMethod: true }
      })
    ]);

    const calculated = calculateLeakageRisk(toLeakageInput(zone));
    const metrics = createLeakageMetrics(zone, previousLeaks, customerComplaints, privateCasesOpen, waterZone);
    const recommendedMethod = getRecommendedMethodLabel(fieldTask?.suggestedMethod);

    return {
      zoneId: zone.id,
      name: zone.name,
      riskScore: score?.score ?? calculated.score,
      confidence: score?.confidence ?? calculated.confidence,
      factors: metrics,
      scoringFactors: calculated.factors,
      keyMetrics: {
        nightFlowIncreasePercent: metrics.nightFlowIncreasePercent,
        estimatedLossM3Day: metrics.estimatedLossM3Day,
        previousLeaks: metrics.previousLeaks,
        privateCasesOpen: metrics.privateCasesOpen,
        trend30d: metrics.trend30d,
        recommendedMethod
      },
      explanation: createConcreteLeakageExplanation(zone.name, metrics, recommendedMethod),
      recommendedAction:
        recommendation?.suggestedAction ??
        `Prioriter ${recommendedMethod.toLowerCase()} i sonen før eventuell videre oppfølging.`,
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
}

function toLeakageInput(zone: ZoneWithPipes) {
  return {
    baselineNightFlow: zone.baselineNightFlow,
    currentNightFlow: zone.currentNightFlow,
    dataQualityScore: zone.dataQualityScore,
    pipes: zone.pipes.map((pipe) => ({
      material: pipe.material,
      installedYear: pipe.installedYear,
      criticality: pipe.criticality,
      previousBreaks: pipe.previousBreaks
    }))
  };
}

function createLeakageMetrics(
  zone: ZoneWithPipes,
  previousLeaks: number,
  customerComplaints: number,
  privateCasesOpen: number,
  waterZone: {
    estimatedLossM3Day: number;
    trend7d: number;
    trend30d: number;
    status: string;
  } | null
) {
  const nightFlowIncreasePercent = getNightFlowIncreasePercent(zone.baselineNightFlow, zone.currentNightFlow);
  const avgPipeAge = calculateAveragePipeAge(zone.pipes);
  const estimatedLossM3Day =
    waterZone?.estimatedLossM3Day ?? round(Math.max(0, (zone.currentNightFlow ?? 0) - (zone.baselineNightFlow ?? 0)) * 24, 1);

  return {
    nightFlowIncreasePercent,
    estimatedLossM3Day,
    avgPipeAge,
    previousLeaks,
    privateCasesOpen,
    pressureVariation: Math.min(25, Math.round(nightFlowIncreasePercent * 0.7)),
    customerComplaints,
    trend7d: waterZone?.trend7d ?? 0,
    trend30d: waterZone?.trend30d ?? 0
  };
}

function getNightFlowIncreasePercent(baseline: number | null, current: number | null) {
  if (!baseline || !current || baseline <= 0) {
    return 0;
  }

  return round(Math.max(0, ((current - baseline) / baseline) * 100), 1);
}

function calculateAveragePipeAge(pipes: Pipe[]) {
  const currentYear = 2026;
  const ages = pipes
    .map((pipe) => (pipe.installedYear ? currentYear - pipe.installedYear : null))
    .filter((age): age is number => age !== null);

  if (ages.length === 0) {
    return 0;
  }

  return Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length);
}

function createConcreteLeakageExplanation(
  zoneName: string,
  metrics: {
    nightFlowIncreasePercent: number;
    estimatedLossM3Day: number;
    avgPipeAge: number;
    previousLeaks: number;
    privateCasesOpen: number;
    pressureVariation: number;
    customerComplaints: number;
    trend30d: number;
  },
  recommendedMethod: string
) {
  return [
    `${zoneName} har ${metrics.nightFlowIncreasePercent} % økning i nattforbruk siste periode sammenlignet med baseline.`,
    `Dette tilsvarer estimert ${metrics.estimatedLossM3Day} m³/døgn mulig vanntap, med ${formatTrend(metrics.trend30d)} trend siste 30 dager.`,
    `Gjennomsnittlig ledningsalder er ${metrics.avgPipeAge} år.`,
    `Det er registrert ${metrics.previousLeaks} tidligere lekkasje-/bruddhendelser, ${metrics.customerComplaints} kundemeldinger og ${metrics.privateCasesOpen} åpne private lekkasjesaker i sonen.`,
    `Anbefalt neste steg er ${recommendedMethod.toLowerCase()} før eventuell videre oppfølging.`
  ].join(" ");
}

function getRecommendedMethodLabel(method?: FieldTaskMethod) {
  const labels: Record<FieldTaskMethod, string> = {
    listening: "lytting",
    logger: "loggerutplassering",
    valve_check: "ventilkontroll",
    meter_follow_up: "måleroppfølging",
    manhole_inspection: "kuminspeksjon",
    cctv: "CCTV",
    smoke_test: "røyktest"
  };

  return method ? labels[method] : "loggerutplassering og lytting";
}

function formatTrend(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)} %`;
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
