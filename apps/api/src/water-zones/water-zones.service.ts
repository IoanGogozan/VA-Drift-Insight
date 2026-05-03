import { Injectable, NotFoundException } from "@nestjs/common";
import { Pipe, WaterZone, Zone } from "@prisma/client";
import { calculateWaterLoss, type WaterZoneStatus } from "@va-drift-insight/shared";
import { PrismaService } from "../database/prisma.service";

type WaterZoneWithZone = WaterZone & {
  zone: (Zone & { pipes: Pipe[] }) | null;
};

@Injectable()
export class WaterZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async getWaterZones() {
    const waterZones = await this.prisma.waterZone.findMany({
      include: {
        zone: {
          include: { pipes: true }
        }
      },
      orderBy: [{ status: "desc" }, { name: "asc" }]
    });

    return waterZones.map((waterZone) => this.toSummary(waterZone));
  }

  async getWaterZone(id: string) {
    const waterZone = await this.prisma.waterZone.findUnique({
      where: { id },
      include: {
        zone: {
          include: { pipes: true }
        }
      }
    });

    if (!waterZone) {
      throw new NotFoundException("Water zone was not found.");
    }

    const [previousLeaks, customerComplaints] = await Promise.all([
      waterZone.zoneId
        ? this.prisma.incident.count({
            where: {
              assetType: "zone",
              assetId: waterZone.zoneId,
              incidentType: { in: ["leak", "pipe_break"] }
            }
          })
        : Promise.resolve(0),
      waterZone.zoneId
        ? this.prisma.incident.count({
            where: {
              assetType: "zone",
              assetId: waterZone.zoneId,
              incidentType: "complaint"
            }
          })
        : Promise.resolve(0)
    ]);

    const summary = this.toSummary(waterZone);
    const avgPipeAge = calculateAveragePipeAge(waterZone.zone?.pipes ?? []);

    return {
      ...summary,
      factors: {
        nightFlowIncreasePercent: summary.nightFlowDeltaPercent,
        avgPipeAge,
        previousLeaks,
        pressureVariation: estimatePressureVariation(summary.nightFlowDeltaPercent),
        customerComplaints
      },
      explanation: createWaterZoneExplanation({
        name: waterZone.name,
        nightFlowDeltaPercent: summary.nightFlowDeltaPercent,
        estimatedLossM3Day: summary.estimatedLossM3Day,
        avgPipeAge,
        previousLeaks,
        customerComplaints
      }),
      recommendedAction: createRecommendedAction(summary.status),
      decisionSupportNote: "Beslutningsstøtte, ikke automatisk diagnose."
    };
  }

  private toSummary(waterZone: WaterZoneWithZone) {
    const calculated = calculateWaterLoss({
      currentNightFlowM3h: waterZone.nightFlowM3h,
      baselineNightFlowM3h: waterZone.baselineNightFlowM3h
    });

    return {
      id: waterZone.id,
      zoneId: waterZone.zoneId,
      name: waterZone.name,
      totalConsumptionM3Day: waterZone.totalConsumptionM3Day,
      nightFlowM3h: waterZone.nightFlowM3h,
      baselineNightFlowM3h: waterZone.baselineNightFlowM3h,
      estimatedLossM3Day: calculated.estimatedLossM3Day,
      nightFlowDeltaPercent: calculated.nightFlowDeltaPercent,
      trend7d: waterZone.trend7d,
      trend30d: waterZone.trend30d,
      status: calculated.status,
      statusLabel: getStatusLabel(calculated.status),
      pipeCount: waterZone.zone?.pipes.length ?? 0,
      dataQualityScore: waterZone.zone?.dataQualityScore ?? null
    };
  }
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

function estimatePressureVariation(nightFlowDeltaPercent: number) {
  return Math.min(25, Math.round(nightFlowDeltaPercent * 0.7));
}

function getStatusLabel(status: WaterZoneStatus) {
  const labels: Record<WaterZoneStatus, string> = {
    normal: "Normal",
    suspect: "Mistenkt",
    high: "Høy"
  };

  return labels[status];
}

function createRecommendedAction(status: WaterZoneStatus) {
  if (status === "high") {
    return "Prioriter akustisk lekkasjesøk, nattmåling og ventilkontroll i sonen.";
  }

  if (status === "suspect") {
    return "Følg nattforbruket tett og vurder logger eller målrettet kontroll.";
  }

  return "Fortsett normal overvåking og oppdater baseline ved nye måledata.";
}

function createWaterZoneExplanation(input: {
  name: string;
  nightFlowDeltaPercent: number;
  estimatedLossM3Day: number;
  avgPipeAge: number;
  previousLeaks: number;
  customerComplaints: number;
}) {
  return [
    `${input.name} har ${input.nightFlowDeltaPercent} % økning i nattforbruk sammenlignet med baseline.`,
    `Estimert vanntap er ${input.estimatedLossM3Day} m³/dag.`,
    `Gjennomsnittlig ledningsalder er ${input.avgPipeAge} år, med ${input.previousLeaks} tidligere lekkasje-/bruddhendelser`,
    `og ${input.customerComplaints} kundemeldinger registrert.`
  ].join(" ");
}
