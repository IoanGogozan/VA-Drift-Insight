import { buildVaRiskReportHtml } from "./report-template";

describe("buildVaRiskReportHtml", () => {
  it("renders operational report sections and safety wording", () => {
    const html = buildVaRiskReportHtml({
      generatedAt: new Date("2026-05-02T10:00:00.000Z"),
      overview: {
        kpis: {
          highRiskLeakageZones: 1,
          fremmedvannSuspicions: 1,
          activeAnomalies: 3,
          recommendedFieldChecks: 2,
          dataCompletenessScore: 74
        }
      },
      leakageScores: [{ assetId: "zone-1", score: 82, confidence: 76, explanation: "Old pipes" }],
      fremmedvannScores: [{ assetId: "ps-1", score: 86, confidence: 78, explanation: "Rain response" }],
      recommendations: [
        {
          priority: "high",
          type: "leakage",
          areaName: "Målesone Nord",
          reason: "Økt nattforbruk",
          suggestedAction: "Akustisk lekkasjesøk",
          status: "new"
        }
      ],
      dataSources: [
        {
          name: "MET Norway Frost API",
          url: "https://frost.met.no/",
          description: "Rainfall",
          isMvp: true
        }
      ]
    });

    expect(html).toContain("VA-risikorapport");
    expect(html).toContain("Beslutningsstøtte, ikke automatisk diagnose.");
    expect(html).toContain("Topp 10 risikoområder");
    expect(html).toContain("MET Norway Frost API");
  });
});
