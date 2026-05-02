CREATE TABLE "municipalities" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "municipality_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "geometry" geometry(MultiPolygon, 4326),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "weather_observations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "source" TEXT NOT NULL,
  "station_id" TEXT NOT NULL,
  "station_name" TEXT,
  "municipality_code" TEXT,
  "observed_at" TIMESTAMP(3) NOT NULL,
  "rainfall_mm" DOUBLE PRECISION,
  "temperature_c" DOUBLE PRECISION,
  "quality_code" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "weather_observations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "external_data_sources" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "source_key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "is_mvp" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "external_data_sources_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "municipalities_municipality_code_key" ON "municipalities"("municipality_code");
CREATE INDEX "municipalities_geometry_idx" ON "municipalities" USING GIST("geometry");
CREATE UNIQUE INDEX "weather_observations_source_station_id_observed_at_key" ON "weather_observations"("source", "station_id", "observed_at");
CREATE INDEX "weather_observations_municipality_code_observed_at_idx" ON "weather_observations"("municipality_code", "observed_at");
CREATE INDEX "weather_observations_station_id_observed_at_idx" ON "weather_observations"("station_id", "observed_at");
CREATE UNIQUE INDEX "external_data_sources_source_key_key" ON "external_data_sources"("source_key");
