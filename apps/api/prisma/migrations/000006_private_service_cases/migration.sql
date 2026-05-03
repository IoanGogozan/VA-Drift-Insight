CREATE TYPE "PrivateServiceCaseStatus" AS ENUM ('suspected', 'contacted', 'repaired', 'closed');

CREATE TABLE private_service_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  zone_id UUID NOT NULL REFERENCES zones(id),
  status "PrivateServiceCaseStatus" NOT NULL DEFAULT 'suspected',
  estimated_loss_m3_day DOUBLE PRECISION NOT NULL,
  last_follow_up TIMESTAMP,
  next_follow_up TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_private_service_cases_zone_id ON private_service_cases(zone_id);
CREATE INDEX idx_private_service_cases_status ON private_service_cases(status);
