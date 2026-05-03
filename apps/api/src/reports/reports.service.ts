import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { PrismaService } from "../database/prisma.service";
import { ConfigService } from "@nestjs/config";
import { buildVaRiskReportHtml } from "./report-template";
import { PdfService } from "./pdf.service";

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly config: ConfigService
  ) {}

  private get reportsDir() {
    return resolve(process.cwd(), this.config.get<string>("PDF_STORAGE_PATH") ?? "reports/generated");
  }

  async generateVaRiskReport() {
    await mkdir(this.reportsDir, { recursive: true });

    const id = randomUUID();
    const fileName = `va-risk-report-${id}.pdf`;
    const filePath = join(this.reportsDir, fileName);
    const html = await this.buildReportHtml();

    await this.pdfService.renderHtmlToPdf(html, filePath);

    return {
      id,
      fileName,
      downloadUrl: `/api/reports/${id}/download`,
      generatedAt: new Date().toISOString()
    };
  }

  async getReportFile(id: string) {
    const fileName = `va-risk-report-${id}.pdf`;
    const filePath = join(this.reportsDir, fileName);

    if (!existsSync(filePath)) {
      throw new NotFoundException("Report was not found.");
    }

    return { fileName, filePath };
  }

  async getMonthlyReport() {
    const [
      leaksFound,
      repairedPrivateCases,
      openPrivateCases,
      openFieldTasks,
      completedFieldTasks,
      highWaterZones,
      highPriorityTasks
    ] = await Promise.all([
      this.prisma.incident.count({
        where: { incidentType: { in: ["leak", "pipe_break"] } }
      }),
      this.prisma.privateServiceCase.findMany({
        where: { status: { in: ["repaired", "closed"] } },
        select: { estimatedLossM3Day: true }
      }),
      this.prisma.privateServiceCase.count({
        where: { status: { in: ["suspected", "contacted"] } }
      }),
      this.prisma.fieldTask.count({
        where: { status: { in: ["new", "planned", "in_progress"] } }
      }),
      this.prisma.fieldTask.count({
        where: { status: "completed" }
      }),
      this.prisma.waterZone.findMany({
        where: { status: "high" },
        select: { name: true, estimatedLossM3Day: true }
      }),
      this.prisma.fieldTask.findMany({
        where: { priority: "high", status: { in: ["new", "planned", "in_progress"] } },
        include: { zone: { select: { name: true } } }
      })
    ]);

    const privateSavedM3PerDay = repairedPrivateCases.reduce((sum, item) => sum + item.estimatedLossM3Day, 0);
    const estimatedSavedM3 = Math.round(privateSavedM3PerDay * 30);
    const recommendedZones = Array.from(
      new Set([...highWaterZones.map((zone) => zone.name), ...highPriorityTasks.map((task) => task.zone.name)])
    );

    return {
      period: getCurrentMonthPeriod(),
      leaksFound,
      estimatedSavedM3,
      municipal: Math.max(0, leaksFound - repairedPrivateCases.length),
      private: repairedPrivateCases.length,
      openCases: openPrivateCases + openFieldTasks,
      completedFieldTasks,
      estimatedOpenLossM3Day: round(highWaterZones.reduce((sum, zone) => sum + zone.estimatedLossM3Day, 0), 1),
      recommendedZones
    };
  }

  private async buildReportHtml() {
    const [recommendations, leakageScores, fremmedvannScores, zones, dataSources] = await Promise.all([
      this.prisma.recommendation.findMany({
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        take: 10
      }),
      this.prisma.riskScore.findMany({
        where: { scoreType: "leakage" },
        orderBy: { score: "desc" }
      }),
      this.prisma.riskScore.findMany({
        where: { scoreType: "fremmedvann" },
        orderBy: { score: "desc" }
      }),
      this.prisma.zone.findMany(),
      this.prisma.externalDataSource.findMany({
        orderBy: { sourceKey: "asc" }
      })
    ]);
    const dataCompletenessScore = Math.round(
      zones.reduce((sum, zone) => sum + (zone.dataQualityScore ?? 0), 0) / Math.max(1, zones.length)
    );

    return buildVaRiskReportHtml({
      generatedAt: new Date(),
      overview: {
        kpis: {
          highRiskLeakageZones: leakageScores.filter((score) => score.assetType === "zone" && score.score >= 75)
            .length,
          fremmedvannSuspicions: fremmedvannScores.filter((score) => score.score >= 70).length,
          activeAnomalies: 0,
          recommendedFieldChecks: recommendations.filter((item) => item.status === "new" || item.status === "planned")
            .length,
          dataCompletenessScore
        }
      },
      leakageScores: leakageScores.map((score) => ({
        assetId: score.assetId,
        score: score.score,
        confidence: score.confidence,
        explanation: score.explanation
      })),
      fremmedvannScores: fremmedvannScores.map((score) => ({
        assetId: score.assetId,
        score: score.score,
        confidence: score.confidence,
        explanation: score.explanation
      })),
      recommendations: recommendations.map((recommendation) => ({
        priority: recommendation.priority,
        type: recommendation.type,
        areaName: recommendation.areaName,
        reason: recommendation.reason,
        suggestedAction: recommendation.suggestedAction,
        status: recommendation.status
      })),
      dataSources: dataSources.map((source) => ({
        name: source.name,
        url: source.url,
        description: source.description,
        isMvp: source.isMvp
      }))
    });
  }
}

function getCurrentMonthPeriod() {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    label: new Intl.DateTimeFormat("nb-NO", {
      month: "long",
      year: "numeric"
    }).format(now)
  };
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
