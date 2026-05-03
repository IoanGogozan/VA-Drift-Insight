import { Controller, Get, Param, ParseUUIDPipe } from "@nestjs/common";
import { WaterZonesService } from "./water-zones.service";

@Controller("water-zones")
export class WaterZonesController {
  constructor(private readonly waterZonesService: WaterZonesService) {}

  @Get()
  getWaterZones() {
    return this.waterZonesService.getWaterZones();
  }

  @Get(":id")
  getWaterZone(@Param("id", ParseUUIDPipe) id: string) {
    return this.waterZonesService.getWaterZone(id);
  }
}
