import { Controller, Get, Param, Post, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { DemoWriteGuard } from "../common/guards/demo-write.guard";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("monthly")
  getMonthlyReport() {
    return this.reportsService.getMonthlyReport();
  }

  @Post("va-risk")
  @UseGuards(DemoWriteGuard)
  generateVaRiskReport() {
    return this.reportsService.generateVaRiskReport();
  }

  @Get(":id/download")
  async downloadReport(@Param("id") id: string, @Res() response: Response) {
    const report = await this.reportsService.getReportFile(id);

    response.setHeader("content-type", "application/pdf");
    response.setHeader("content-disposition", `attachment; filename="${report.fileName}"`);
    response.sendFile(report.filePath);
  }
}
