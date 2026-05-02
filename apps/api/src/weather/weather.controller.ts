import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { DemoWriteGuard } from "../common/guards/demo-write.guard";
import { WeatherService } from "./weather.service";

@Controller()
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get("weather/rainfall")
  getRainfall(
    @Query("municipalityCode") municipalityCode?: string,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    return this.weatherService.getRainfall({ municipalityCode, from, to });
  }

  @Post("import/weather/frost")
  @UseGuards(DemoWriteGuard)
  importFrostRainfall(
    @Query("municipalityCode") municipalityCode?: string,
    @Query("stationId") stationId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    return this.weatherService.importFrostRainfall({ municipalityCode, stationId, from, to });
  }
}
