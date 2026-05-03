import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { FieldTaskStatus, RecommendationPriority } from "@prisma/client";
import { DemoWriteGuard } from "../common/guards/demo-write.guard";
import { UpdateFieldTaskDto } from "./dto/update-field-task.dto";
import { FieldTasksService } from "./field-tasks.service";

@Controller("field-tasks")
export class FieldTasksController {
  constructor(private readonly fieldTasksService: FieldTasksService) {}

  @Get()
  getFieldTasks(@Query("priority") priority?: RecommendationPriority, @Query("status") status?: FieldTaskStatus) {
    return this.fieldTasksService.getFieldTasks({ priority, status });
  }

  @Get(":id")
  getFieldTask(@Param("id", ParseUUIDPipe) id: string) {
    return this.fieldTasksService.getFieldTask(id);
  }

  @Patch(":id")
  @UseGuards(DemoWriteGuard)
  updateFieldTask(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateFieldTaskDto) {
    return this.fieldTasksService.updateFieldTask(id, dto);
  }
}
