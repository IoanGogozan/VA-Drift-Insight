import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { RecommendationPriority, RecommendationStatus, RecommendationType } from "@prisma/client";
import { DemoWriteGuard } from "../common/guards/demo-write.guard";
import { UpdateRecommendationStatusDto } from "./dto/update-recommendation-status.dto";
import { RecommendationsService } from "./recommendations.service";

@Controller("recommendations")
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  getRecommendations(
    @Query("priority") priority?: RecommendationPriority,
    @Query("type") type?: RecommendationType,
    @Query("status") status?: RecommendationStatus
  ) {
    return this.recommendationsService.getRecommendations({ priority, type, status });
  }

  @Patch(":id/status")
  @UseGuards(DemoWriteGuard)
  updateStatus(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateRecommendationStatusDto) {
    return this.recommendationsService.updateStatus(id, dto.status);
  }
}
