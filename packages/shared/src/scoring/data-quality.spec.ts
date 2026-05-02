import { calculateDataQuality } from "./data-quality";

describe("calculateDataQuality", () => {
  it("returns low data quality when pipe age and sensor data are missing", () => {
    const result = calculateDataQuality({
      pipeAgeCompleteness: 20,
      materialCompleteness: 90,
      sensorDataAvailability: 10,
      geolocationQuality: 80,
      incidentHistoryQuality: 50,
      recentDataCoverage: 20
    });

    expect(result.score).toBeLessThan(60);
  });

  it("returns high data quality when key data categories are complete", () => {
    const result = calculateDataQuality({
      pipeAgeCompleteness: 95,
      materialCompleteness: 95,
      sensorDataAvailability: 90,
      geolocationQuality: 90,
      incidentHistoryQuality: 85,
      recentDataCoverage: 90
    });

    expect(result.score).toBeGreaterThanOrEqual(90);
  });
});
