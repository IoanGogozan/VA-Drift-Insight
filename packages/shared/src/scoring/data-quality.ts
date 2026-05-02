import type { DataQualityFactors, DataQualityInput, ScoreResult } from "./types";
import { clampScore } from "./utils";

export function calculateDataQuality(input: DataQualityInput): ScoreResult<DataQualityFactors> {
  const factors = {
    pipeAgeCompleteness: clampScore(input.pipeAgeCompleteness),
    materialCompleteness: clampScore(input.materialCompleteness),
    sensorDataAvailability: clampScore(input.sensorDataAvailability),
    geolocationQuality: clampScore(input.geolocationQuality),
    incidentHistoryQuality: clampScore(input.incidentHistoryQuality),
    recentDataCoverage: clampScore(input.recentDataCoverage)
  };
  const score = clampScore(
    factors.pipeAgeCompleteness * 0.25 +
      factors.materialCompleteness * 0.2 +
      factors.sensorDataAvailability * 0.2 +
      factors.geolocationQuality * 0.15 +
      factors.incidentHistoryQuality * 0.1 +
      factors.recentDataCoverage * 0.1
  );

  return {
    score,
    confidence: 100,
    factors,
    explanation: createDataQualityExplanation(score)
  };
}

function createDataQualityExplanation(score: number) {
  if (score >= 80) {
    return "Datakvaliteten er god nok til operativ prioritering i demoen.";
  }

  if (score >= 60) {
    return "Datakvaliteten er brukbar, men enkelte datagap bør følges opp.";
  }

  return "Datakvaliteten er redusert og bør forbedres før beslutninger tas med høy sikkerhet.";
}
