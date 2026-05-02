# VA Drift Insight

A practical demo application for Norwegian water and wastewater operations.

The app combines GIS, time-series data, incidents and explainable scoring methods to support leakage control, fremmedvann analysis and maintenance prioritization.

## Demo Message

Jeg kan koble praktisk VA-forståelse med moderne backend, data, kart og rapportering.

The goal is not to present "AI magic". The goal is to show how existing operational data can become practical decision support for municipalities, intermunicipal companies and consultants.

## Application Subtitle

Et praktisk beslutningsstøtteverktøy for lekkasjekontroll, fremmedvann og driftsdata

## Why This Project

Municipalities and intermunicipal water companies often have data from pipes, pump stations, meters, alarms, incidents and rainfall, but the data can be difficult to use for operational prioritization.

This demo shows how backend systems, maps, PostGIS, scoring and reporting can turn operational data into practical decision support.

## Main Features

- VA risk overview
- Leakage risk scoring
- Fremmedvann analysis
- Pump station rainfall response
- Work recommendation table
- Data quality scoring
- PDF risk report

## Tech Stack

- Node.js
- NestJS
- REST API
- PostgreSQL/PostGIS
- Prisma
- Next.js
- TypeScript
- MapLibre GL or Leaflet
- Recharts
- TanStack Table
- Tailwind CSS and shadcn/ui
- Docker Compose
- Puppeteer for PDF generation

## Language Rules

- Application UI: Norwegian
- Code, comments and commit messages: English
- Technical documentation: English
- Demo script and interview pitch: Norwegian

## Documentation

- [Product brief](docs/product-brief.md)
- [Implementation roadmap](docs/implementation-roadmap.md)
- [Architecture](docs/architecture.md)
- [Domain model](docs/domain-model.md)
- [API design](docs/api-design.md)
- [Scoring methodology](docs/scoring-methodology.md)
- [Seed data plan](docs/seed-data.md)
- [UI screens](docs/ui-screens.md)
- [PDF report specification](docs/pdf-report.md)
- [Implementation checklist](docs/implementation-checklist.md)
- [Demo script in Norwegian](docs/demo-script-no.md)

## Current Status

The repository is in Phase 1: monorepo foundation.

Implemented so far:

- Git repository initialized
- Root npm workspace configuration
- Shared TypeScript package scaffold
- Docker Compose with PostGIS
- Environment template
- Documentation set for implementation

## Local Development

Prerequisites:

- Node.js 20.11 or newer
- npm
- Docker Desktop

Install dependencies:

```bash
npm install
```

Start PostgreSQL/PostGIS:

```bash
docker compose up -d postgres
```

PostgreSQL is exposed on local port `5433` to avoid conflicts with an existing local database.

Run shared package typecheck:

```bash
npm run typecheck --workspace @va-drift-insight/shared
```

Apply database migrations:

```bash
$env:DATABASE_URL="postgresql://va_demo:va_demo@localhost:5433/va_drift_insight"
npm exec --workspace @va-drift-insight/api -- prisma migrate deploy
```

Seed demo data:

```bash
$env:DATABASE_URL="postgresql://va_demo:va_demo@localhost:5433/va_drift_insight"
npm run prisma:seed --workspace @va-drift-insight/api
```

Build and start the API:

```bash
npm run build --workspace @va-drift-insight/api
$env:DATABASE_URL="postgresql://va_demo:va_demo@localhost:5433/va_drift_insight"
$env:API_PORT="3001"
npm run start --workspace @va-drift-insight/api
```

Health checks:

```text
GET http://localhost:3001/api/health
GET http://localhost:3001/api/health/db
```

OpenAPI/Swagger:

```text
http://localhost:3001/api/docs
```

The web application will be added in a later implementation phase.

## MVP Priority

Build the application in this order:

1. Map and overview KPIs
2. Explainable leakage risk scoring
3. Fremmedvann analysis chart
4. Recommendations workflow
5. PDF report
6. Data quality details
7. CSV import
8. Optional cloud deployment

Auth, multi-tenancy, Kubernetes, complex user management and real SCADA integrations are outside the MVP.

## Portfolio Positioning

This project combines practical VVS/VA understanding with software engineering. It demonstrates how field knowledge can be translated into backend systems, APIs, data models, maps, scoring and reporting tools for VA operations.

Norwegian positioning:

Prosjektet kombinerer min praktiske bakgrunn som faglært VVS-installatør i Norge med backend-utvikling, databaser, API-er og kartbasert beslutningsstøtte. Målet er å vise hvordan feltforståelse kan omsettes til nyttige digitale verktøy for VA-drift.
