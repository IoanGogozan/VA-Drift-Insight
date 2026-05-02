import type { FremmedvannFactors, FremmedvannInput, ScoreResult } from "./types";
import { clampScore } from "./utils";

export function calculateFremmedvannRisk(input: FremmedvannInput): ScoreResult<FremmedvannFactors> {
  const alarmCount = input.alarmCount ?? 0;
  const overflowEvents = input.overflowEvents ?? 0;
  const factors = {
    rainfallCorrelation: alarmCount >= 5 ? 85 : alarmCount >= 2 ? 60 : 25,
    pumpRuntimeIncrease: alarmCount >= 5 ? 80 : alarmCount >= 2 ? 55 : 25,
    delayedFlowResponse: overflowEvents > 0 ? 75 : alarmCount >= 5 ? 60 : 35,
    overflowEvents: clampScore(overflowEvents * 40),
    highLevelAlarms: clampScore(alarmCount * 12)
  };
  const score = clampScore(
    factors.rainfallCorrelation * 0.35 +
      factors.pumpRuntimeIncrease * 0.25 +
      factors.delayedFlowResponse * 0.2 +
      factors.overflowEvents * 0.1 +
      factors.highLevelAlarms * 0.1
  );

  return {
    score,
    confidence: calculateFremmedvannConfidence(input),
    factors,
    explanation: createFremmedvannExplanation(input)
  };
}

export function getFremmedvannSuspicionLevel(score: number) {
  if (score >= 75) return "Høy";
  if (score >= 50) return "Medium";
  return "Lav";
}

function calculateFremmedvannConfidence(input: FremmedvannInput) {
  const hasOperationalSignals = (input.alarmCount ?? 0) > 0 || (input.overflowEvents ?? 0) > 0;
  const rainfallPenalty = input.rainfallDataAvailable === false ? 25 : 0;

  return clampScore((hasOperationalSignals ? 78 : 60) - rainfallPenalty);
}

function createFremmedvannExplanation(input: FremmedvannInput) {
  if ((input.alarmCount ?? 0) >= 5 || (input.overflowEvents ?? 0) > 0) {
    return "Pumpestasjonen har gjentatte våtværsrelaterte alarmer og overløpshendelser som gir mistanke om fremmedvann.";
  }

  return "Pumpestasjonen har begrensede indikasjoner på regnrelatert respons i demo-datasettet.";
}
