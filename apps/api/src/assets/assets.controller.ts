import { Controller, Get } from "@nestjs/common";
import { AssetsService } from "./assets.service";

@Controller("map/assets")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  getMapAssets() {
    return this.assetsService.getMapAssets();
  }
}
