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
      waterZones: [
        {
          name: "Målesone Nord",
          nightFlowM3h: 22.1,
          baselineNightFlowM3h: 18,
          estimatedLossM3Day: 98.4,
          trend30d: 14.2,
          status: "high",
          dataQualityScore: 72
        }
      ],
      privateCases: [
        {
          address: "Kirkegata 8",
          zoneName: "Målesone Nord",
          estimatedLossM3Day: 7.8,
          status: "suspected",
          nextFollowUp: new Date("2026-05-10T08:00:00.000Z")
        }
      ],
      fieldTasks: [
        {
          priority: "high",
          areaName: "Målesone Nord",
          type: "leakage_control",
          reason: "Økt nattforbruk",
          suggestedMethod: "logger",
          status: "planned"
        }
      ],
      dataGaps: [
        {
          area: "Ledningsregister",
          finding: "2 ledninger mangler installasjonsår.",
          recommendation: "Oppdater installasjonsår."
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
    expect(html).toContain("Vannsoner og estimert vanntap");
    expect(html).toContain("Private stikkledninger");
    expect(html).toContain("Anbefalte feltkontroller");
    expect(html).toContain("Topp anbefalte tiltak");
    expect(html).toContain("Ledningsregister");
    expect(html).toContain("MET Norway Frost API");
  });
});
