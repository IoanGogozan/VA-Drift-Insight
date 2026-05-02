import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AssetsModule } from "./assets/assets.module";
import { DatabaseModule } from "./database/database.module";
import { FremmedvannModule } from "./fremmedvann/fremmedvann.module";
import { HealthModule } from "./health/health.module";
import { LeakageModule } from "./leakage/leakage.module";
import { OverviewModule } from "./overview/overview.module";
import { RecommendationsModule } from "./recommendations/recommendations.module";
import { VersionModule } from "./version/version.module";

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
    RecommendationsModule
  ]
})
export class AppModule {}
