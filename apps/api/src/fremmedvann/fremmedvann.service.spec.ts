import { FremmedvannService } from "./fremmedvann.service";

describe("FremmedvannService", () => {
  it("returns pump station analysis with dry/wet metrics and deterministic chart data", async () => {
    const pumpStation = {
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      stationCode: "PS-03",
      name: "Skoglia",
      catchmentId: "55555555-5555-4555-8555-555555555555",
      capacityM3h: 180,
      alarmCount: 7,
      overflowEvents: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      geometry: null,
      catchment: { name: "Avløpssone B" }
    };
    const prisma = {
      pumpStation: { findUnique: jest.fn().mockResolvedValue(pumpStation) },
      riskScore: {
        findFirst: jest.fn().mockResolvedValue({
          score: 86,
          confidence: 78,
          explanation: "Seeded explanation"
        })
      },
      recommendation: {
        findFirst: jest.fn().mockResolvedValue({ suggestedAction: "CCTV/røyktest" })
      },
      incident: { findMany: jest.fn().mockResolvedValue([]) }
    };
    const service = new FremmedvannService(prisma as never);

    await expect(service.getPumpStationAnalysis(pumpStation.id)).resolves.toMatchObject({
      pumpStationId: pumpStation.id,
      stationCode: "PS-03",
      suspicionScore: 86,
      suspicionLevel: "Høy",
      recommendedAction: "CCTV/røyktest",
      dryWetMetrics: {
        dryWeatherBaselineMinutes: 24,
        wetWeatherPeakRuntimeMinutes: 46,
        pumpRuntimeIncreasePercent: 91.7,
        responseDelayHours: 4,
        elevatedDurationHours: 10,
        highLevelAlarms: 7,
        overflowEvents: 2
      }
    });
    const analysis = await service.getPumpStationAnalysis(pumpStation.id);

    expect(analysis.chartData).toHaveLength(24);
    expect(analysis.chartData[8]).toMatchObject({
      dryWeatherBaselineMinutes: 24,
      isAnomaly: true
    });
  });
});
