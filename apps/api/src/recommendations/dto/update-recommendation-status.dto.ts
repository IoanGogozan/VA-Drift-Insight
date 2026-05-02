import { RecommendationStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateRecommendationStatusDto {
  @IsEnum(RecommendationStatus)
  status!: RecommendationStatus;
}
