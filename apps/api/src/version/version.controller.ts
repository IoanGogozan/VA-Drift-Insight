import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Controller("version")
export class VersionController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  getVersion() {
    return {
      status: "ok",
      service: "va-drift-insight-api",
      version: this.config.get<string>("API_VERSION") ?? "0.1.0"
    };
  }
}
