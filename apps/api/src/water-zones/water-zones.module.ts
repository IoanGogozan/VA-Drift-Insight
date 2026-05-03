import { Module } from "@nestjs/common";
import { WaterZonesController } from "./water-zones.controller";
import { WaterZonesService } from "./water-zones.service";

@Module({
  controllers: [WaterZonesController],
  providers: [WaterZonesService]
})
export class WaterZonesModule {}
