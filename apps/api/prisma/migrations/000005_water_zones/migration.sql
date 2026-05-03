CREATE TYPE "WaterZoneStatus" AS ENUM ('normal', 'suspect', 'high');

CREATE TABLE water_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID UNIQUE REFERENCES zones(id),
  name TEXT NOT NULL,
  total_consumption_m3_day DOUBLE PRECISION NOT NULL,
  night_flow_m3h DOUBLE PRECISION NOT NULL,
  baseline_night_flow_m3h DOUBLE PRECISION NOT NULL,
  estimated_loss_m3_day DOUBLE PRECISION NOT NULL,
  trend_7d DOUBLE PRECISION NOT NULL DEFAULT 0,
  trend_30d DOUBLE PRECISION NOT NULL DEFAULT 0,
  status "WaterZoneStatus" NOT NULL,
  geometry geometry(Polygon, 4326),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_water_zones_status ON water_zones(status);
CREATE INDEX idx_water_zones_geometry ON water_zones USING GIST(geometry);
