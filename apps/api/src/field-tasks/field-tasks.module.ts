import { Module } from "@nestjs/common";
import { FieldTasksController } from "./field-tasks.controller";
import { FieldTasksService } from "./field-tasks.service";

@Module({
  controllers: [FieldTasksController],
  providers: [FieldTasksService]
})
export class FieldTasksModule {}
