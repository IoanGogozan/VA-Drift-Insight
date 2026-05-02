import { ConfigService } from "@nestjs/config";
import { MunicipalityService } from "./municipality.service";

describe("MunicipalityService", () => {
  it("returns default municipality as GeoJSON map context", async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([
        {
          id: "municipality-1",
          municipality_code: "3905",
          name: "Tonsberg kommune",
          source: "Kartverket fallback",
          geometry: '{"type":"MultiPolygon","coordinates":[]}'
        }
      ])
    };
    const service = new MunicipalityService(
      prisma as never,
      new ConfigService({ DEFAULT_MUNICIPALITY_CODE: "3905" })
    );

    await expect(service.getMapContext()).resolves.toMatchObject({
      type: "FeatureCollection",
      features: [
        {
          id: "municipality-1",
          properties: {
            municipalityCode: "3905",
            name: "Tonsberg kommune"
          }
        }
      ]
    });
  });
});
