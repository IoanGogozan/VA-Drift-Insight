CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE "ZoneType" AS ENUM ('water_meter_zone', 'wastewater_catchment');
CREATE TYPE "PipeType" AS ENUM ('water', 'wastewater', 'stormwater');
CREATE TYPE "AssetType" AS ENUM ('zone', 'pipe', 'pump_station');
CREATE TYPE "IncidentType" AS ENUM ('leak', 'pipe_break', 'high_level_alarm', 'overflow', 'complaint', 'pump_failure', 'suspected_fremmedvann');
CREATE TYPE "ScoreType" AS ENUM ('leakage', 'fremmedvann', 'data_quality', 'sanering');
CREATE TYPE "RecommendationType" AS ENUM ('leakage', 'fremmedvann', 'sanering', 'data_gap');
CREATE TYPE "RecommendationPriority" AS ENUM ('high', 'medium', 'low');
CREATE TYPE "RecommendationStatus" AS ENUM ('new', 'planned', 'in_progress', 'completed', 'dismissed');

CREATE TABLE "zones" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "zone_type" "ZoneType" NOT NULL,
  "population" INTEGER,
  "baseline_night_flow" DOUBLE PRECISION,
  "current_night_flow" DOUBLE PRECISION,
  "data_quality_score" INTEGER,
  "geometry" geometry,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pipes" (
  "id" TEXT NOT NULL,
  "pipe_code" TEXT NOT NULL,
  "zone_id" TEXT,
  "material" TEXT NOT NULL,
  "installed_year" INTEGER,
  "diameter_mm" INTEGER,
  "pipe_type" "PipeType" NOT NULL,
  "criticality" INTEGER NOT NULL DEFAULT 50,
  "previous_breaks" INTEGER NOT NULL DEFAULT 0,
  "geometry" geometry,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pipes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pump_stations" (
  "id" TEXT NOT NULL,
  "station_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "catchment_id" TEXT,
  "capacity_m3h" DOUBLE PRECISION,
  "alarm_count" INTEGER NOT NULL DEFAULT 0,
  "overflow_events" INTEGER NOT NULL DEFAULT 0,
  "geometry" geometry,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pump_stations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "time_series" (
  "id" TEXT NOT NULL,
  "asset_type" "AssetType" NOT NULL,
  "asset_id" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "flow_m3h" DOUBLE PRECISION,
  "pressure_bar" DOUBLE PRECISION,
  "level_m" DOUBLE PRECISION,
  "pump_runtime_minutes" INTEGER,
  "rainfall_mm" DOUBLE PRECISION,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "time_series_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "incidents" (
  "id" TEXT NOT NULL,
  "incident_type" "IncidentType" NOT NULL,
  "asset_type" "AssetType" NOT NULL,
  "asset_id" TEXT NOT NULL,
  "occurred_at" TIMESTAMP(3) NOT NULL,
  "description" TEXT NOT NULL,
  "resolved_at" TIMESTAMP(3),
  "geometry" geometry,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "risk_scores" (
  "id" TEXT NOT NULL,
  "asset_type" "AssetType" NOT NULL,
  "asset_id" TEXT NOT NULL,
  "score_type" "ScoreType" NOT NULL,
  "score" INTEGER NOT NULL,
  "confidence" INTEGER NOT NULL,
  "explanation" TEXT NOT NULL,
  "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "risk_scores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recommendations" (
  "id" TEXT NOT NULL,
  "type" "RecommendationType" NOT NULL,
  "priority" "RecommendationPriority" NOT NULL,
  "asset_type" "AssetType" NOT NULL,
  "asset_id" TEXT NOT NULL,
  "area_name" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "suggested_action" TEXT NOT NULL,
  "status" "RecommendationStatus" NOT NULL DEFAULT 'new',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pipes_pipe_code_key" ON "pipes"("pipe_code");
CREATE UNIQUE INDEX "pump_stations_station_code_key" ON "pump_stations"("station_code");
CREATE INDEX "time_series_asset_type_asset_id_timestamp_idx" ON "time_series"("asset_type", "asset_id", "timestamp");
CREATE INDEX "incidents_asset_type_asset_id_occurred_at_idx" ON "incidents"("asset_type", "asset_id", "occurred_at");
CREATE INDEX "risk_scores_asset_type_asset_id_score_type_idx" ON "risk_scores"("asset_type", "asset_id", "score_type");
CREATE INDEX "recommendations_priority_status_idx" ON "recommendations"("priority", "status");

ALTER TABLE "pipes" ADD CONSTRAINT "pipes_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pump_stations" ADD CONSTRAINT "pump_stations_catchment_id_fkey" FOREIGN KEY ("catchment_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
