import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WeatherService } from "./weather.service";

describe("WeatherService", () => {
  it("returns fallback rainfall observations from the database", async () => {
    const prisma = {
      weatherObservation: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "obs-1",
            source: "MET Norway Frost API fallback",
            stationId: "SN27450",
            stationName: "Tonsberg - demo station",
            observedAt: new Date("2026-04-20T06:00:00.000Z"),
            rainfallMm: 14.6,
            temperatureC: 8.4,
            qualityCode: "0"
          }
        ])
      }
    };
    const service = new WeatherService(
      prisma as never,
      {} as never,
      new ConfigService({ DEFAULT_MUNICIPALITY_CODE: "3905" })
    );

    await expect(service.getRainfall({ municipalityCode: "3905" })).resolves.toMatchObject({
      municipalityCode: "3905",
      source: "MET Norway Frost API fallback",
      observations: [
        {
          stationId: "SN27450",
          rainfallMm: 14.6
        }
      ]
    });
  });

  it("rejects invalid date ranges", async () => {
    const service = new WeatherService(
      { weatherObservation: { findMany: jest.fn() } } as never,
      {} as never,
      new ConfigService()
    );

    await expect(
      service.getRainfall({ from: "2026-05-01", to: "2026-04-01" })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
