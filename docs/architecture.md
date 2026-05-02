# Architecture

## High-Level Diagram

```text
Next.js Frontend
   |
   | REST API
   v
NestJS Backend
   |
   | Prisma
   v
PostgreSQL + PostGIS
   |
   +--> Seed data / CSV import
   +--> Scoring engine
   +--> PDF report generator
   +--> Public data cache

External public sources
   |
   +--> MET Norway Frost API: rainfall observations
   +--> Kartverket / Geonorge: maps and municipality boundaries
   +--> SSB / KOSTRA: optional municipality statistics
```

## Repository Structure

```text
va-drift-insight/
  apps/
    api/
      src/
      prisma/
      Dockerfile
      package.json

    web/
      app/
      components/
      lib/
      public/
      package.json

  packages/
    shared/
      src/
        types/
        scoring/
        constants/

  data/
    seed/
      pipes.geojson
      zones.geojson
      pump_stations.geojson
      time_series.csv
      incidents.csv

  docs/
    architecture.md
    domain-model.md
    scoring-methodology.md
    demo-script-no.md

  docker-compose.yml
  README.md
```

## Backend Stack

- Node.js
- NestJS
- REST API
- Prisma ORM
- PostgreSQL + PostGIS
- Zod for import validation and DTO validation where useful
- Puppeteer for PDF generation
- OpenAPI/Swagger from NestJS
- BullMQ and Redis only if async imports or scoring jobs become necessary

## Backend Module Plan

```text
src/
  app.module.ts

  common/
    filters/
    interceptors/
    dto/
    utils/

  database/
    prisma.service.ts

  assets/
    assets.controller.ts
    assets.service.ts

  zones/
    zones.controller.ts
    zones.service.ts

  pump-stations/
    pump-stations.controller.ts
    pump-stations.service.ts

  time-series/
    time-series.controller.ts
    time-series.service.ts

  incidents/
    incidents.controller.ts
    incidents.service.ts

  scoring/
    scoring.controller.ts
    scoring.service.ts
    leakage-risk.service.ts
    fremmedvann-risk.service.ts
    data-quality.service.ts

  recommendations/
    recommendations.controller.ts
    recommendations.service.ts

  reports/
    reports.controller.ts
    reports.service.ts
    pdf.service.ts

  imports/
    imports.controller.ts
    imports.service.ts

  external-data/
    met/
      frost-client.ts
      frost.service.ts

    kartverket/
      kartverket-client.ts
      municipality-boundary.service.ts

    ssb/
      ssb-client.ts
      ssb.service.ts

  weather/
    weather.controller.ts
    weather.service.ts

  municipality/
    municipality.controller.ts
    municipality.service.ts
```

## External Data Strategy

The MVP should combine real public Norwegian data with simulated VA operational data.

MVP public sources:

- MET Norway Frost API for historical precipitation
- Kartverket grensedata / Geonorge kommunegrenser for map context and municipality boundaries

Phase 2 source:

- SSB / KOSTRA for municipality water and wastewater context

The pipe network, pump station operations, leakage incidents, pump runtime, flow, pressure and alarms remain simulated because real VA infrastructure data is sensitive and not suitable for a public demo.

See [External data sources](external-data-sources.md).

## Frontend Stack

- Next.js
- TypeScript
- MapLibre GL or Leaflet
- Recharts
- TanStack Table
- Tailwind CSS
- shadcn/ui

## Docker Compose Services

```yaml
services:
  postgres:
    image: postgis/postgis:16-3.4
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: va_demo
      POSTGRES_PASSWORD: va_demo
      POSTGRES_DB: va_drift_insight
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: ./apps/api
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://va_demo:va_demo@postgres:5432/va_drift_insight

  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    depends_on:
      - api
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001

volumes:
  postgres_data:
```

## Deployment

Recommended sequence:

1. Complete local Docker demo
2. Record a short video demo or add screenshots
3. Deploy only if time allows

Possible cloud deployment:

- Supabase Postgres for database
- Render, Fly.io or Railway for API
- Vercel for frontend
