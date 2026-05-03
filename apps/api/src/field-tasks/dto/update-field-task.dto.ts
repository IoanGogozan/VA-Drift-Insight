import { FieldTaskStatus } from "@prisma/client";
import { IsEnum, IsISO8601, IsOptional } from "class-validator";

export class UpdateFieldTaskDto {
  @IsOptional()
  @IsEnum(FieldTaskStatus)
  status?: FieldTaskStatus;

  @IsOptional()
  @IsISO8601()
  lastChecked?: string | null;
}
