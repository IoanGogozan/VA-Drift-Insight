import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

type ValidationIssue = {
  entityType: string;
  entityId: string | null;
  field: string;
  severity: "warning" | "error";
  message: string;
};

type DemoAssetCounts = {
  zones: number;
  waterZones: number;
  privateCases: number;
  fieldTasks: number;
  pipes: number;
  pumpStations: number;
  incidents: number;
  timeSeries: number;
  weatherObservations: number;
  networkNodes: number;
};

@Injectable()
export class ImportsService {
  constructor(private readonly prisma: PrismaService) {}

  async runDemoDatasetImport() {
    const startedAt = Date.now();
    const [counts, issues] = await Promise.all([this.getDemoAssetCounts(), this.validateDemoDataset()]);
    const errorCount = issues.filter((issue) => issue.severity === "error").length;
    const warningCount = issues.filter((issue) => issue.severity === "warning").length;
    const totalRows = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const durationMs = Date.now() - startedAt;

    const run = await this.prisma.importRun.create({
      data: {
        importType: "demo_dataset",
        status: errorCount > 0 ? "completed_with_errors" : warningCount > 0 ? "completed_with_warnings" : "completed",
        totalRows,
        acceptedRows: Math.max(0, totalRows - errorCount),
        rejectedRows: errorCount,
        warningCount,
        durationMs,
        completedAt: new Date(),
        summary: counts as unknown as Prisma.InputJsonValue,
        validationErrors: {
          create: issues.map((issue) => ({
            entityType: issue.entityType,
            entityId: issue.entityId,
            field: issue.field,
            severity: issue.severity,
            message: issue.message
          }))
        }
      },
      include: { validationErrors: true }
    });

    return this.formatImportRun(run);
  }

  async getImportRuns() {
    const runs = await this.prisma.importRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { validationErrors: true }
    });

    return runs.map((run) => this.formatImportRun(run));
  }

  async getImportRun(id: string) {
    const run = await this.prisma.importRun.findUnique({
      where: { id },
      include: { validationErrors: true }
    });

    if (!run) {
      throw new NotFoundException("Import run was not found.");
    }

    return this.formatImportRun(run);
  }

  private async getDemoAssetCounts(): Promise<DemoAssetCounts> {
    const [
      zones,
      waterZones,
      privateCases,
      fieldTasks,
      pipes,
      pumpStations,
      incidents,
      timeSeries,
      weatherObservations,
      networkNodes
    ] = await Promise.all([
      this.prisma.zone.count(),
      this.prisma.waterZone.count(),
      this.prisma.privateServiceCase.count(),
      this.prisma.fieldTask.count(),
      this.prisma.pipe.count(),
      this.prisma.pumpStation.count(),
      this.prisma.incident.count(),
      this.prisma.timeSeries.count(),
      this.prisma.weatherObservation.count(),
      this.prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM network_nodes`
    ]);

    return {
      zones,
      waterZones,
      privateCases,
      fieldTasks,
      pipes,
      pumpStations,
      incidents,
      timeSeries,
      weatherObservations,
      networkNodes: Number(networkNodes[0]?.count ?? 0)
    };
  }

  private async validateDemoDataset(): Promise<ValidationIssue[]> {
    const [
      pipesMissingYear,
      pipesMissingGeometry,
      pumpStationsMissingGeometry,
      incidentsMissingGeometry,
      zonesMissingQuality,
      waterZonesMissingGeometry,
      timeSeriesCount
    ] =
      await Promise.all([
        this.prisma.pipe.findMany({
          where: { installedYear: null },
          select: { id: true, pipeCode: true }
        }),
        this.prisma.$queryRaw<Array<{ id: string; pipe_code: string }>>`
          SELECT id::text, pipe_code
          FROM pipes
          WHERE geometry IS NULL
        `,
        this.prisma.$queryRaw<Array<{ id: string; station_code: string }>>`
          SELECT id::text, station_code
          FROM pump_stations
          WHERE geometry IS NULL
        `,
        this.prisma.$queryRaw<Array<{ id: string; description: string }>>`
          SELECT id::text, description
          FROM incidents
          WHERE geometry IS NULL
        `,
        this.prisma.zone.findMany({
          where: { dataQualityScore: null },
          select: { id: true, name: true }
        }),
        this.prisma.$queryRaw<Array<{ id: string; name: string }>>`
          SELECT id::text, name
          FROM water_zones
          WHERE geometry IS NULL
        `,
        this.prisma.timeSeries.count()
      ]);

    const issues: ValidationIssue[] = [];

    for (const pipe of pipesMissingYear) {
      issues.push({
        entityType: "pipe",
        entityId: pipe.id,
        field: "installed_year",
        severity: "warning",
        message: `Ledning ${pipe.pipeCode} mangler installasjonsår.`
      });
    }

    for (const pipe of pipesMissingGeometry) {
      issues.push({
        entityType: "pipe",
        entityId: pipe.id,
        field: "geometry",
        severity: "error",
        message: `Ledning ${pipe.pipe_code} mangler geometri.`
      });
    }

    for (const station of pumpStationsMissingGeometry) {
      issues.push({
        entityType: "pump_station",
        entityId: station.id,
        field: "geometry",
        severity: "error",
        message: `Pumpestasjon ${station.station_code} mangler geometri.`
      });
    }

    for (const incident of incidentsMissingGeometry) {
      issues.push({
        entityType: "incident",
        entityId: incident.id,
        field: "geometry",
        severity: "warning",
        message: `Hendelsen "${incident.description}" mangler geometri.`
      });
    }

    for (const zone of zonesMissingQuality) {
      issues.push({
        entityType: "zone",
        entityId: zone.id,
        field: "data_quality_score",
        severity: "warning",
        message: `Sone ${zone.name} mangler datakvalitetsscore.`
      });
    }

    for (const waterZone of waterZonesMissingGeometry) {
      issues.push({
        entityType: "water_zone",
        entityId: waterZone.id,
        field: "geometry",
        severity: "warning",
        message: `Vannsone ${waterZone.name} mangler geometri.`
      });
    }

    if (timeSeriesCount === 0) {
      issues.push({
        entityType: "time_series",
        entityId: null,
        field: "rows",
        severity: "warning",
        message: "Ingen tidsseriedata ble funnet. Fremmedvann-analysen bruker fallback-data for grafen."
      });
    }

    return issues;
  }

  private formatImportRun<T extends { validationErrors?: Array<unknown> }>(run: T) {
    return run;
  }
}
