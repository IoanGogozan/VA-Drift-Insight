import { Controller, Get, Param, ParseUUIDPipe } from "@nestjs/common";
import { FremmedvannService } from "./fremmedvann.service";

@Controller("fremmedvann/pump-stations")
export class FremmedvannController {
  constructor(private readonly fremmedvannService: FremmedvannService) {}

  @Get()
  getPumpStations() {
    return this.fremmedvannService.getPumpStations();
  }

  @Get(":id/analysis")
  getPumpStationAnalysis(@Param("id", ParseUUIDPipe) id: string) {
    return this.fremmedvannService.getPumpStationAnalysis(id);
  }
}
