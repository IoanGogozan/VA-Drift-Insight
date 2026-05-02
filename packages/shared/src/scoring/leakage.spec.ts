import { calculateLeakageRisk } from "./leakage";

describe("calculateLeakageRisk", () => {
  it("returns high risk for old cast iron pipe with previous breaks and night flow anomaly", () => {
    const result = calculateLeakageRisk({
      baselineNightFlow: 18,
      currentNightFlow: 24,
      dataQualityScore: 85,
      pipes: [
        {
          material: "støpejern",
          installedYear: 1965,
          criticality: 90,
          previousBreaks: 3
        }
      ]
    });

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.factors.pipeAge).toBeGreaterThanOrEqual(80);
    expect(result.factors.nightFlowAnomaly).toBeGreaterThanOrEqual(90);
  });

  it("returns medium risk for old pipe without night flow anomaly", () => {
    const result = calculateLeakageRisk({
      baselineNightFlow: 18,
      currentNightFlow: 18.5,
      dataQualityScore: 80,
      pipes: [
        {
          material: "støpejern",
          installedYear: 1972,
          criticality: 60,
          previousBreaks: 0
        }
      ]
    });

    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThan(75);
  });

  it("lowers confidence when installed year is missing", () => {
    const complete = calculateLeakageRisk({
      baselineNightFlow: 10,
      currentNightFlow: 11,
      dataQualityScore: 90,
      pipes: [{ material: "PE", installedYear: 2020, criticality: 30, previousBreaks: 0 }]
    });
    const missingYear = calculateLeakageRisk({
      baselineNightFlow: 10,
      currentNightFlow: 11,
      dataQualityScore: 90,
      pipes: [{ material: "PE", installedYear: null, criticality: 30, previousBreaks: 0 }]
    });

    expect(missingYear.confidence).toBeLessThan(complete.confidence);
  });

  it("keeps score within 0 and 100", () => {
    const result = calculateLeakageRisk({
      baselineNightFlow: 1,
      currentNightFlow: 100,
      dataQualityScore: 100,
      pipes: [{ material: "eternitt/asbestsement", installedYear: 1900, criticality: 500, previousBreaks: 20 }]
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
