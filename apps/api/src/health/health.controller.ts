import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHealth() {
    return {
      status: "ok",
      service: "va-drift-insight-api"
    };
  }

  @Get("db")
  async getDatabaseHealth() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: "ok",
      database: "reachable"
    };
  }
}
