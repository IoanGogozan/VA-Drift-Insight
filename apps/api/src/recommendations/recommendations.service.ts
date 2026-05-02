import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { RecommendationPriority, RecommendationStatus, RecommendationType } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

type RecommendationFilters = {
  priority?: RecommendationPriority;
  type?: RecommendationType;
  status?: RecommendationStatus;
};

const priorityOrder: Record<RecommendationPriority, number> = {
  high: 1,
  medium: 2,
  low: 3
};

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendations(filters: RecommendationFilters) {
    this.validateFilters(filters);

    const recommendations = await this.prisma.recommendation.findMany({
      where: {
        priority: filters.priority,
        type: filters.type,
        status: filters.status
      },
      orderBy: { createdAt: "desc" }
    });

    return recommendations.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  async updateStatus(id: string, status: RecommendationStatus) {
    const existing = await this.prisma.recommendation.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new NotFoundException("Recommendation was not found.");
    }

    return this.prisma.recommendation.update({
      where: { id },
      data: { status }
    });
  }

  private validateFilters(filters: RecommendationFilters) {
    if (filters.priority && !isEnumValue(RecommendationPriority, filters.priority)) {
      throw new BadRequestException("Invalid recommendation priority.");
    }

    if (filters.type && !isEnumValue(RecommendationType, filters.type)) {
      throw new BadRequestException("Invalid recommendation type.");
    }

    if (filters.status && !isEnumValue(RecommendationStatus, filters.status)) {
      throw new BadRequestException("Invalid recommendation status.");
    }
  }
}

function isEnumValue<T extends Record<string, string>>(enumObject: T, value: string) {
  return Object.values(enumObject).includes(value);
}
