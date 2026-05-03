import { Module } from "@nestjs/common";
import { PrivateCasesController } from "./private-cases.controller";
import { PrivateCasesService } from "./private-cases.service";

@Module({
  controllers: [PrivateCasesController],
  providers: [PrivateCasesService]
})
export class PrivateCasesModule {}
