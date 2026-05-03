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
      package.json

    web/
      app/
      components/
      lib/
      package.json

  packages/
    shared/
      src/
        types/
        scoring/
        constants/

  docs/
    architecture.md
    api-design.md
    domain-model.md
    scoring-methodology.md
    engineering-guidelines.md
    engineering-decisions.md
    external-data-sources.md
    product-brief.md

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

## Backend Modules

```text
src/
  app.module.ts

  common/
    dto/
    guards/

  database/
    prisma.service.ts

  assets/
    assets.controller.ts
    assets.service.ts

  water-zones/
    water-zones.controller.ts
    water-zones.service.ts

  leakage/
    leakage.controller.ts
    leakage.service.ts

  fremmedvann/
    fremmedvann.controller.ts
    fremmedvann.service.ts

  imports/
    imports.controller.ts
    imports.service.ts

  private-cases/
    private-cases.controller.ts
    private-cases.service.ts

  field-tasks/
    field-tasks.controller.ts
    field-tasks.service.ts

  recommendations/
    recommendations.controller.ts
    recommendations.service.ts

  reports/
    reports.controller.ts
    reports.service.ts
    pdf.service.ts

  external-data/
    met/
      frost-client.ts
      frost.service.ts

  weather/
    weather.controller.ts
    weather.service.ts

  municipality/
    municipality.controller.ts
    municipality.service.ts
```

## External Data Strategy

The demo combines real public Norwegian data with simulated VA operational data.

Public sources:

- MET Norway Frost API for historical precipitation
- Kartverket grensedata / Geonorge kommunegrenser for map context and municipality boundaries

Optional future source:

- SSB / KOSTRA for municipality water and wastewater context

The pipe network, pump station operations, leakage incidents, pump runtime, flow, pressure and alarms remain simulated because real VA infrastructure data is sensitive and not suitable for a public demo.

See [External data sources](external-data-sources.md).

## Frontend Stack

- Next.js
- TypeScript
- Leaflet and React Leaflet
- Custom SVG chart components
- Native typed table components
- Tailwind CSS
- lucide-react icons

## Docker Compose Services

Docker Compose is used for the local PostgreSQL/PostGIS database. The API and web app run through the root `npm run dev` command during local development.

```yaml
services:
  postgres:
    image: postgis/postgis:16-3.4
    container_name: va-drift-insight-postgres
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: va_demo
      POSTGRES_PASSWORD: va_demo
      POSTGRES_DB: va_drift_insight
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U va_demo -d va_drift_insight"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## Deployment

Possible cloud deployment:

- Supabase Postgres for database
- Render, Fly.io or Railway for API
- Vercel for frontend
