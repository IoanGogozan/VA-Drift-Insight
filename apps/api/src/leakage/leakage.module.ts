import { Module } from "@nestjs/common";
import { LeakageController } from "./leakage.controller";
import { LeakageService } from "./leakage.service";

@Module({
  controllers: [LeakageController],
  providers: [LeakageService]
})
export class LeakageModule {}
