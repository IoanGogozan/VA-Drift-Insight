export type AssetType = "zone" | "pipe" | "pump_station";

export type ZoneType = "water_meter_zone" | "wastewater_catchment";

export type PipeType = "water" | "wastewater" | "stormwater";

export type ScoreType = "leakage" | "fremmedvann" | "data_quality" | "sanering";

export type RecommendationType = "leakage" | "fremmedvann" | "sanering" | "data_gap";

export type RecommendationPriority = "high" | "medium" | "low";

export type RecommendationStatus =
  | "new"
  | "planned"
  | "in_progress"
  | "completed"
  | "dismissed";

export type IncidentType =
  | "leak"
  | "pipe_break"
  | "high_level_alarm"
  | "overflow"
  | "complaint"
  | "pump_failure"
  | "suspected_fremmedvann";
