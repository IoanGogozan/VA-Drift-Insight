import type { LeakageFactors, LeakageZoneInput, ScoreBand, ScoreResult } from "./types";
import { average, clampScore } from "./utils";

export function calculateLeakageRisk(input: LeakageZoneInput): ScoreResult<LeakageFactors> {
  const factors = calculateLeakageFactors(input);
  const score = clampScore(
    factors.pipeAge * 0.25 +
      factors.material * 0.2 +
      factors.historicalBreaks * 0.2 +
      factors.nightFlowAnomaly * 0.2 +
      factors.pressureVariation * 0.1 +
      factors.criticality * 0.05
  );

  return {
    score,
    confidence: calculateLeakageConfidence(input),
    factors,
    explanation: createLeakageExplanation(input)
  };
}

export function getLeakageRiskBand(score: number): ScoreBand {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

export function getPipeAgeScore(installedYear: number | null, referenceYear = new Date().getFullYear()) {
  if (!installedYear) {
    return 60;
  }

  const age = referenceYear - installedYear;

  if (age <= 10) return 10;
  if (age <= 25) return 30;
  if (age <= 40) return 55;
  if (age <= 60) return 80;
  return 95;
}

export function getMaterialScore(material: string | null) {
  const normalized = material?.toLowerCase() ?? "";

  if (normalized === "pe") return 25;
  if (normalized === "pvc") return 40;
  if (normalized.includes("duktilt")) return 55;
  if (normalized.includes("støpejern") || normalized.includes("stopejern")) return 75;
  if (normalized.includes("betong")) return 65;
  if (normalized.includes("eternitt") || normalized.includes("asbest")) return 80;
  return 55;
}

export function getNightFlowIncreasePercent(baseline: number | null, current: number | null) {
  if (!baseline || !current || baseline <= 0) {
    return 0;
  }

  return Math.max(0, ((current - baseline) / baseline) * 100);
}

function calculateLeakageFactors(input: LeakageZoneInput): LeakageFactors {
  return {
    pipeAge: average(input.pipes.map((pipe) => getPipeAgeScore(pipe.installedYear))),
    material: average(input.pipes.map((pipe) => getMaterialScore(pipe.material))),
    historicalBreaks: clampScore(average(input.pipes.map((pipe) => (pipe.previousBreaks ?? 0) * 40))),
    nightFlowAnomaly: clampScore(getNightFlowIncreasePercent(input.baselineNightFlow, input.currentNightFlow) * 5),
    pressureVariation: 60,
    criticality: average(input.pipes.map((pipe) => pipe.criticality ?? 50))
  };
}

function calculateLeakageConfidence(input: LeakageZoneInput) {
  const missingInstalledYears = input.pipes.filter((pipe) => !pipe.installedYear).length;
  const missingMaterials = input.pipes.filter((pipe) => !pipe.material).length;
  const pipeCount = input.pipes.length;
  const agePenalty = pipeCount === 0 ? 25 : (missingInstalledYears / pipeCount) * 25;
  const materialPenalty = pipeCount === 0 ? 15 : (missingMaterials / pipeCount) * 15;
  const sensorPenalty = !input.baselineNightFlow || !input.currentNightFlow ? 15 : 0;

  return clampScore((input.dataQualityScore ?? 70) - agePenalty - materialPenalty - sensorPenalty);
}

function createLeakageExplanation(input: LeakageZoneInput) {
  const anomaly = getNightFlowIncreasePercent(input.baselineNightFlow, input.currentNightFlow);
  const oldPipeCount = input.pipes.filter((pipe) => getPipeAgeScore(pipe.installedYear) >= 80).length;
  const previousBreaks = input.pipes.reduce((sum, pipe) => sum + (pipe.previousBreaks ?? 0), 0);

  return `Risikoen vurderes ut fra ${Math.round(anomaly)} % økning i nattforbruk, ${oldPipeCount} eldre ledninger og ${previousBreaks} tidligere hendelser i sonen.`;
}
