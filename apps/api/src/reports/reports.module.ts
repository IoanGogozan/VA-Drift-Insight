import { Module } from "@nestjs/common";
import { DemoWriteGuard } from "../common/guards/demo-write.guard";
import { DatabaseModule } from "../database/database.module";
import { PdfService } from "./pdf.service";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
  imports: [DatabaseModule],
  controllers: [ReportsController],
  providers: [ReportsService, PdfService, DemoWriteGuard]
})
export class ReportsModule {}
