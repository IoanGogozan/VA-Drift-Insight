import type { IncidentType, RecommendationStatus } from "./types";

export const APP_NAME = "VA Drift Insight";

export const MUNICIPALITY_NAME = "Fjordvik kommune";

export const INCIDENT_LABELS_NO: Record<IncidentType, string> = {
  leak: "Vannlekkasje",
  pipe_break: "Ledningsbrudd",
  high_level_alarm: "Høy-nivå alarm",
  overflow: "Overløp",
  complaint: "Kundemelding",
  pump_failure: "Pumpefeil",
  suspected_fremmedvann: "Mistanke om fremmedvann"
};

export const RECOMMENDATION_STATUS_LABELS_NO: Record<RecommendationStatus, string> = {
  new: "Ny",
  planned: "Planlagt",
  in_progress: "Pågår",
  completed: "Fullført",
  dismissed: "Avvist"
};
