import { Controller, Get, Param, ParseUUIDPipe } from "@nestjs/common";
import { LeakageService } from "./leakage.service";

@Controller("leakage/zones")
export class LeakageController {
  constructor(private readonly leakageService: LeakageService) {}

  @Get()
  getZones() {
    return this.leakageService.getZones();
  }

  @Get(":id")
  getZone(@Param("id", ParseUUIDPipe) id: string) {
    return this.leakageService.getZoneAnalysis(id);
  }
}
