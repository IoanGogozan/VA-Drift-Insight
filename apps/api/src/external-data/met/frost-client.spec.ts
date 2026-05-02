import { normalizeFrostResponse } from "./frost-client";

describe("normalizeFrostResponse", () => {
  it("normalizes Frost precipitation and temperature observations", () => {
    const observations = normalizeFrostResponse(
      {
        data: [
          {
            sourceId: "SN27450:0",
            referenceTime: "2026-04-20T06:00:00.000Z",
            observations: [
              {
                elementId: "sum(precipitation_amount P1D)",
                value: 12.4,
                qualityCode: "0"
              },
              {
                elementId: "mean(air_temperature P1D)",
                value: 8.7,
                qualityCode: "1"
              }
            ]
          }
        ]
      },
      "Tonsberg"
    );

    expect(observations).toEqual([
      {
        stationId: "SN27450",
        stationName: "Tonsberg",
        observedAt: new Date("2026-04-20T06:00:00.000Z"),
        rainfallMm: 12.4,
        temperatureC: 8.7,
        qualityCode: "0"
      }
    ]);
  });
});
