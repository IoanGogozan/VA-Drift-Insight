import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { PrivateServiceCaseStatus } from "@prisma/client";
import { DemoWriteGuard } from "../common/guards/demo-write.guard";
import { UpdatePrivateCaseDto } from "./dto/update-private-case.dto";
import { PrivateCasesService } from "./private-cases.service";

@Controller("private-cases")
export class PrivateCasesController {
  constructor(private readonly privateCasesService: PrivateCasesService) {}

  @Get()
  getPrivateCases(@Query("status") status?: PrivateServiceCaseStatus) {
    return this.privateCasesService.getPrivateCases({ status });
  }

  @Get(":id")
  getPrivateCase(@Param("id", ParseUUIDPipe) id: string) {
    return this.privateCasesService.getPrivateCase(id);
  }

  @Patch(":id")
  @UseGuards(DemoWriteGuard)
  updatePrivateCase(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdatePrivateCaseDto) {
    return this.privateCasesService.updatePrivateCase(id, dto);
  }
}
