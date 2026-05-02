import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { MunicipalityController } from "./municipality.controller";
import { MunicipalityService } from "./municipality.service";

@Module({
  imports: [DatabaseModule],
  controllers: [MunicipalityController],
  providers: [MunicipalityService],
  exports: [MunicipalityService]
})
export class MunicipalityModule {}
