import { LeakageService } from "./leakage.service";

describe("LeakageService", () => {
  it("returns high leakage risk details for a seeded high-risk zone", async () => {
    const zone = {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Målesone Nord",
      zoneType: "water_meter_zone",
      population: 4200,
      baselineNightFlow: 18,
      currentNightFlow: 21.1,
      dataQualityScore: 72,
      createdAt: new Date(),
      updatedAt: new Date(),
      geometry: null,
      pipes: [
        {
          id: "77777777-7777-4777-8777-777777777777",
          pipeCode: "Ledning 141",
          zoneId: "11111111-1111-4111-8111-111111111111",
          material: "støpejern",
          installedYear: 1974,
          diameterMm: 160,
          pipeType: "water",
          criticality: 75,
          previousBreaks: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          geometry: null
        }
      ]
    };
    const prisma = {
      zone: { findFirst: jest.fn().mockResolvedValue(zone) },
      riskScore: {
        findFirst: jest.fn().mockResolvedValue({
          score: 82,
          confidence: 76,
          explanation: "Seeded explanation"
        })
      },
      recommendation: {
        findFirst: jest.fn().mockResolvedValue({ suggestedAction: "Akustisk lekkasjesøk" })
      },
      incident: { findMany: jest.fn().mockResolvedValue([]) }
    };
    const service = new LeakageService(prisma as never);

    await expect(service.getZoneAnalysis(zone.id)).resolves.toMatchObject({
      zoneId: zone.id,
      riskScore: 82,
      confidence: 76,
      recommendedAction: "Akustisk lekkasjesøk",
      decisionSupportNote: "Beslutningsstøtte, ikke automatisk diagnose."
    });
  });
});
