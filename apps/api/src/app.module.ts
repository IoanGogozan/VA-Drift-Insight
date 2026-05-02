import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AssetsModule } from "./assets/assets.module";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { OverviewModule } from "./overview/overview.module";
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
    AssetsModule
  ]
})
export class AppModule {}
