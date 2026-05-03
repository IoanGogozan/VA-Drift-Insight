import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AssetsModule } from "./assets/assets.module";
import { DatabaseModule } from "./database/database.module";
import { FremmedvannModule } from "./fremmedvann/fremmedvann.module";
import { HealthModule } from "./health/health.module";
import { ImportsModule } from "./imports/imports.module";
import { LeakageModule } from "./leakage/leakage.module";
import { MunicipalityModule } from "./municipality/municipality.module";
import { OverviewModule } from "./overview/overview.module";
import { PrivateCasesModule } from "./private-cases/private-cases.module";
import { RecommendationsModule } from "./recommendations/recommendations.module";
import { ReportsModule } from "./reports/reports.module";
import { VersionModule } from "./version/version.module";
import { WeatherModule } from "./weather/weather.module";
import { WaterZonesModule } from "./water-zones/water-zones.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100
      }
    ]),
    DatabaseModule,
    HealthModule,
    VersionModule,
    OverviewModule,
    AssetsModule,
    LeakageModule,
    FremmedvannModule,
    ImportsModule,
    PrivateCasesModule,
    RecommendationsModule,
    MunicipalityModule,
    WeatherModule,
    WaterZonesModule,
    ReportsModule
  ]
})
export class AppModule {}
