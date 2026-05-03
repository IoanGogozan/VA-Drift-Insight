CREATE TYPE "FieldTaskType" AS ENUM (
  'leakage_control',
  'fremmedvann_control',
  'meter_follow_up',
  'valve_check',
  'data_quality'
);

CREATE TYPE "FieldTaskStatus" AS ENUM ('new', 'planned', 'in_progress', 'completed', 'cancelled');

CREATE TYPE "FieldTaskMethod" AS ENUM (
  'listening',
  'logger',
  'valve_check',
  'meter_follow_up',
  'manhole_inspection',
  'cctv',
  'smoke_test'
);

CREATE TABLE field_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type "FieldTaskType" NOT NULL,
  zone_id UUID NOT NULL REFERENCES zones(id),
  priority "RecommendationPriority" NOT NULL,
  reason TEXT NOT NULL,
  suggested_method "FieldTaskMethod" NOT NULL,
  status "FieldTaskStatus" NOT NULL DEFAULT 'new',
  last_checked TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_field_tasks_zone_id ON field_tasks(zone_id);
CREATE INDEX idx_field_tasks_priority_status ON field_tasks(priority, status);
