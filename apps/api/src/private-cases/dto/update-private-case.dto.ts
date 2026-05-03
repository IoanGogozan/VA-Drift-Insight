import { PrivateServiceCaseStatus } from "@prisma/client";
import { IsEnum, IsISO8601, IsNumber, IsOptional, Min } from "class-validator";

export class UpdatePrivateCaseDto {
  @IsOptional()
  @IsEnum(PrivateServiceCaseStatus)
  status?: PrivateServiceCaseStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedLossM3Day?: number;

  @IsOptional()
  @IsISO8601()
  nextFollowUp?: string | null;
}
