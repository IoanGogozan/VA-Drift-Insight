export type ScoreBand = "low" | "medium" | "high";

export type ScoreResult<TFactors extends Record<string, number>> = {
  score: number;
  confidence: number;
  factors: TFactors;
  explanation: string;
};

export type LeakagePipeInput = {
  material: string | null;
  installedYear: number | null;
  criticality: number | null;
  previousBreaks: number | null;
};

export type LeakageZoneInput = {
  baselineNightFlow: number | null;
  currentNightFlow: number | null;
  dataQualityScore: number | null;
  pipes: LeakagePipeInput[];
};

export type LeakageFactors = {
  pipeAge: number;
  material: number;
  historicalBreaks: number;
  nightFlowAnomaly: number;
  pressureVariation: number;
  criticality: number;
};

export type FremmedvannInput = {
  alarmCount: number | null;
  overflowEvents: number | null;
  rainfallDataAvailable?: boolean;
};

export type FremmedvannFactors = {
  rainfallCorrelation: number;
  pumpRuntimeIncrease: number;
  delayedFlowResponse: number;
  overflowEvents: number;
  highLevelAlarms: number;
};

export type DataQualityInput = {
  pipeAgeCompleteness: number;
  materialCompleteness: number;
  sensorDataAvailability: number;
  geolocationQuality: number;
  incidentHistoryQuality: number;
  recentDataCoverage: number;
};

export type DataQualityFactors = {
  pipeAgeCompleteness: number;
  materialCompleteness: number;
  sensorDataAvailability: number;
  geolocationQuality: number;
  incidentHistoryQuality: number;
  recentDataCoverage: number;
};
