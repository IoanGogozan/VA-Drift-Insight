import { Module } from "@nestjs/common";
import { FremmedvannController } from "./fremmedvann.controller";
import { FremmedvannService } from "./fremmedvann.service";

@Module({
  controllers: [FremmedvannController],
  providers: [FremmedvannService]
})
export class FremmedvannModule {}
