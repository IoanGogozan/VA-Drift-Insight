import { BadRequestException, NotFoundException } from "@nestjs/common";
import { RecommendationsService } from "./recommendations.service";

describe("RecommendationsService", () => {
  const recommendation = {
    id: "20000000-0000-4000-8000-000000000001",
    type: "leakage",
    priority: "high",
    assetType: "zone",
    assetId: "11111111-1111-4111-8111-111111111111",
    areaName: "Målesone Nord",
    reason: "Økt nattforbruk",
    suggestedAction: "Akustisk lekkasjesøk",
    status: "new",
    createdAt: new Date("2026-05-02T10:00:00.000Z"),
    updatedAt: new Date("2026-05-02T10:00:00.000Z")
  };

  function createService(overrides = {}) {
    const prisma = {
      recommendation: {
        findMany: jest.fn().mockResolvedValue([recommendation]),
        findUnique: jest.fn().mockResolvedValue(recommendation),
        update: jest.fn().mockResolvedValue({ ...recommendation, status: "planned" }),
        ...overrides
      }
    };

    return {
      service: new RecommendationsService(prisma as never),
      prisma
    };
  }

  it("returns recommendations ordered by priority", async () => {
    const lowPriority = {
      ...recommendation,
      id: "20000000-0000-4000-8000-000000000002",
      priority: "low",
      createdAt: new Date("2026-05-02T12:00:00.000Z")
    };
    const { service } = createService({
      findMany: jest.fn().mockResolvedValue([lowPriority, recommendation])
    });

    await expect(service.getRecommendations({})).resolves.toMatchObject([
      { id: recommendation.id },
      { id: lowPriority.id }
    ]);
  });

  it("rejects invalid query filter values", async () => {
    const { service } = createService();

    await expect(service.getRecommendations({ priority: "urgent" as never })).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("updates recommendation status when the recommendation exists", async () => {
    const { service, prisma } = createService();

    await expect(service.updateStatus(recommendation.id, "planned")).resolves.toMatchObject({
      id: recommendation.id,
      status: "planned"
    });
    expect(prisma.recommendation.update).toHaveBeenCalledWith({
      where: { id: recommendation.id },
      data: { status: "planned" }
    });
  });

  it("throws not found when updating a missing recommendation", async () => {
    const { service } = createService({
      findUnique: jest.fn().mockResolvedValue(null)
    });

    await expect(service.updateStatus(recommendation.id, "planned")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
});
