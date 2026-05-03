import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from "@nestjs/common";
import { DemoWriteGuard } from "../common/guards/demo-write.guard";
import { ImportsService } from "./imports.service";

@Controller("import")
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post("demo-dataset")
  @UseGuards(DemoWriteGuard)
  runDemoDatasetImport() {
    return this.importsService.runDemoDatasetImport();
  }

  @Get("runs")
  getImportRuns() {
    return this.importsService.getImportRuns();
  }

  @Get("runs/:id")
  getImportRun(@Param("id", ParseUUIDPipe) id: string) {
    return this.importsService.getImportRun(id);
  }
}
