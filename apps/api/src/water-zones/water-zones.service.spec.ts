import { WaterZonesService } from "./water-zones.service";

describe("WaterZonesService", () => {
  it("calculates estimated water loss and high status from night flow delta", async () => {
    const waterZone = {
      id: "31111111-1111-4111-8111-111111111111",
      zoneId: "11111111-1111-4111-8111-111111111111",
      name: "Målesone Nord",
      totalConsumptionM3Day: 1840,
      nightFlowM3h: 24,
      baselineNightFlowM3h: 18,
      estimatedLossM3Day: 0,
      trend7d: 6.4,
      trend30d: 22,
      status: "high",
      createdAt: new Date(),
      updatedAt: new Date(),
      geometry: null,
      zone: {
        id: "11111111-1111-4111-8111-111111111111",
        name: "Målesone Nord",
        zoneType: "water_meter_zone",
        population: 4200,
        baselineNightFlow: 18,
        currentNightFlow: 24,
        dataQualityScore: 72,
        createdAt: new Date(),
        updatedAt: new Date(),
        geometry: null,
        pipes: [
          {
            id: "pipe-1",
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
      }
    };
    const prisma = {
      waterZone: { findUnique: jest.fn().mockResolvedValue(waterZone) },
      incident: { count: jest.fn().mockResolvedValue(1) }
    };
    const service = new WaterZonesService(prisma as never);

    await expect(service.getWaterZone(waterZone.id)).resolves.toMatchObject({
      id: waterZone.id,
      estimatedLossM3Day: 144,
      nightFlowDeltaPercent: 33.3,
      status: "high",
      statusLabel: "Høy",
      factors: {
        avgPipeAge: 52,
        previousLeaks: 1,
        customerComplaints: 1
      }
    });
  });
});
