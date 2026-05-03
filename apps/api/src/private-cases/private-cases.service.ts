import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrivateServiceCaseStatus } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { UpdatePrivateCaseDto } from "./dto/update-private-case.dto";

type PrivateCaseFilters = {
  status?: PrivateServiceCaseStatus;
};

@Injectable()
export class PrivateCasesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPrivateCases(filters: PrivateCaseFilters) {
    this.validateFilters(filters);

    const cases = await this.prisma.privateServiceCase.findMany({
      where: { status: filters.status },
      include: {
        zone: {
          select: { id: true, name: true }
        }
      },
      orderBy: [{ status: "asc" }, { nextFollowUp: "asc" }, { createdAt: "desc" }]
    });

    return cases.map(formatPrivateCase);
  }

  async getPrivateCase(id: string) {
    const privateCase = await this.prisma.privateServiceCase.findUnique({
      where: { id },
      include: {
        zone: {
          select: { id: true, name: true }
        }
      }
    });

    if (!privateCase) {
      throw new NotFoundException("Private service case was not found.");
    }

    return formatPrivateCase(privateCase);
  }

  async updatePrivateCase(id: string, dto: UpdatePrivateCaseDto) {
    const existing = await this.prisma.privateServiceCase.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new NotFoundException("Private service case was not found.");
    }

    const updated = await this.prisma.privateServiceCase.update({
      where: { id },
      data: {
        status: dto.status,
        estimatedLossM3Day: dto.estimatedLossM3Day,
        nextFollowUp: dto.nextFollowUp === null ? null : dto.nextFollowUp ? new Date(dto.nextFollowUp) : undefined,
        lastFollowUp: dto.status && dto.status !== existing.status ? new Date() : undefined
      },
      include: {
        zone: {
          select: { id: true, name: true }
        }
      }
    });

    return formatPrivateCase(updated);
  }

  private validateFilters(filters: PrivateCaseFilters) {
    if (filters.status && !Object.values(PrivateServiceCaseStatus).includes(filters.status)) {
      throw new BadRequestException("Invalid private service case status.");
    }
  }
}

function formatPrivateCase<T extends {
  id: string;
  address: string;
  status: PrivateServiceCaseStatus;
  estimatedLossM3Day: number;
  lastFollowUp: Date | null;
  nextFollowUp: Date | null;
  createdAt: Date;
  updatedAt: Date;
  zone: { id: string; name: string };
}>(privateCase: T) {
  return {
    id: privateCase.id,
    address: privateCase.address,
    zoneId: privateCase.zone.id,
    zoneName: privateCase.zone.name,
    status: privateCase.status,
    statusLabel: getStatusLabel(privateCase.status),
    estimatedLossM3Day: privateCase.estimatedLossM3Day,
    lastFollowUp: privateCase.lastFollowUp,
    nextFollowUp: privateCase.nextFollowUp,
    createdAt: privateCase.createdAt,
    updatedAt: privateCase.updatedAt
  };
}

function getStatusLabel(status: PrivateServiceCaseStatus) {
  const labels: Record<PrivateServiceCaseStatus, string> = {
    suspected: "Mistenkt",
    contacted: "Kontaktet",
    repaired: "Reparert",
    closed: "Lukket"
  };

  return labels[status];
}
