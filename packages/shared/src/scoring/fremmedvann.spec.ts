import { calculateFremmedvannRisk } from "./fremmedvann";

describe("calculateFremmedvannRisk", () => {
  it("returns high suspicion when alarms and overflow events exist", () => {
    const result = calculateFremmedvannRisk({
      alarmCount: 7,
      overflowEvents: 2,
      rainfallDataAvailable: true
    });

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.confidence).toBeGreaterThanOrEqual(70);
  });

  it("returns low suspicion when pump station signals are stable", () => {
    const result = calculateFremmedvannRisk({
      alarmCount: 0,
      overflowEvents: 0,
      rainfallDataAvailable: true
    });

    expect(result.score).toBeLessThan(50);
  });

  it("increases score when overflow events exist", () => {
    const withoutOverflow = calculateFremmedvannRisk({
      alarmCount: 2,
      overflowEvents: 0,
      rainfallDataAvailable: true
    });
    const withOverflow = calculateFremmedvannRisk({
      alarmCount: 2,
      overflowEvents: 2,
      rainfallDataAvailable: true
    });

    expect(withOverflow.score).toBeGreaterThan(withoutOverflow.score);
  });

  it("lowers confidence when rainfall data is missing", () => {
    const withRainfall = calculateFremmedvannRisk({
      alarmCount: 5,
      overflowEvents: 1,
      rainfallDataAvailable: true
    });
    const withoutRainfall = calculateFremmedvannRisk({
      alarmCount: 5,
      overflowEvents: 1,
      rainfallDataAvailable: false
    });

    expect(withoutRainfall.confidence).toBeLessThan(withRainfall.confidence);
  });
});
