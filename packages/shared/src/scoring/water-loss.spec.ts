import { calculateWaterLoss } from "./water-loss";

describe("calculateWaterLoss", () => {
  it("returns high status when night flow is more than 20 percent above baseline", () => {
    const result = calculateWaterLoss({
      currentNightFlowM3h: 24,
      baselineNightFlowM3h: 18
    });

    expect(result).toEqual({
      estimatedLossM3Day: 144,
      nightFlowDeltaPercent: 33.3,
      status: "high"
    });
  });

  it("returns suspect status for 10 to 20 percent increase", () => {
    const result = calculateWaterLoss({
      currentNightFlowM3h: 22,
      baselineNightFlowM3h: 20
    });

    expect(result.status).toBe("suspect");
    expect(result.estimatedLossM3Day).toBe(48);
  });

  it("does not return negative estimated loss", () => {
    const result = calculateWaterLoss({
      currentNightFlowM3h: 9,
      baselineNightFlowM3h: 12
    });

    expect(result.estimatedLossM3Day).toBe(0);
    expect(result.nightFlowDeltaPercent).toBe(0);
    expect(result.status).toBe("normal");
  });
});
