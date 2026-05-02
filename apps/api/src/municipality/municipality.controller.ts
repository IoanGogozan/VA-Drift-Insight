import { Controller, Get } from "@nestjs/common";
import { MunicipalityService } from "./municipality.service";

@Controller()
export class MunicipalityController {
  constructor(private readonly municipalityService: MunicipalityService) {}

  @Get("municipality")
  getMunicipality() {
    return this.municipalityService.getDefaultMunicipality();
  }

  @Get("map/context")
  getMapContext() {
    return this.municipalityService.getMapContext();
  }
}
