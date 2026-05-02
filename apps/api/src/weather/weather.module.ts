import { Module } from "@nestjs/common";
import { DemoWriteGuard } from "../common/guards/demo-write.guard";
import { DatabaseModule } from "../database/database.module";
import { FrostClient } from "../external-data/met/frost-client";
import { WeatherController } from "./weather.controller";
import { WeatherService } from "./weather.service";

@Module({
  imports: [DatabaseModule],
  controllers: [WeatherController],
  providers: [WeatherService, FrostClient, DemoWriteGuard],
  exports: [WeatherService]
})
export class WeatherModule {}
