# VA Drift Insight

A practical demo application for Norwegian water and wastewater operations.

The app combines GIS, time-series data, incidents and explainable scoring methods to support leakage control, fremmedvann analysis and maintenance prioritization.

The updated MVP direction is to combine open Norwegian public data sources with simulated VA operational data.

## Demo Message

Jeg kan koble praktisk VA-/VVS-forståelse med moderne backend, data, kart og rapportering.

The goal is not to present "AI magic". The goal is to show how existing operational data can become practical decision support for municipalities, intermunicipal companies and consultants.

## Application Subtitle

Demo for datadrevet lekkasjekontroll, vanntap og feltoppfølging.

## Why This Project

Municipalities and intermunicipal water companies often have data from pipes, pump stations, meters, alarms, incidents and rainfall, but the data can be difficult to use for operational prioritization.

This demo shows how backend systems, maps, PostGIS, scoring and reporting can turn operational data into practical decision support.

## Relevance For VA Roles

This portfolio demo is designed for general VA/VVS-related software roles, not for one specific employer. It shows how practical field understanding can be translated into a backend-driven workflow for leakage control, water loss reduction, field follow-up and reporting.

The demo focuses on:

- water zones and night flow trends
- estimated water loss
- water meter and operational data
- leakage history and risk factors
- private service line follow-up
- recommended field tasks and methods
- data quality and import validation
- PDF reporting for meetings and planning

The goal is not to replace existing SCADA, Gemini/GISLINE, VA database systems or professional judgement. The goal is to show how exported data, maps, database models, API services and reports can make existing VA data easier to use for practical prioritization.

Norwegian positioning:

```text
Dette er et porteføljeprosjekt som viser hvordan praktisk VVS-/VA-erfaring kan kombineres
med backend, databaser, kart og rapportering for å støtte lekkasjekontroll,
vanntapsreduksjon og datadrevet feltoppfølging.

Demoen bruker simulerte VA-data. Målet er beslutningsstøtte, ikke automatisk diagnose.
```

## Main Features

- VA risk overview
- Water zones with estimated water loss
- Leakage risk scoring
- Fremmedvann analysis
- Private service line case follow-up
- Field task workflow
- Monthly operational report summary
- Pump station rainfall response
- Work recommendation table
- Data quality scoring
- Public data source labeling
- MET Norway Frost rainfall integration
- Kartverket / Geonorge municipality boundary integration
- PDF risk report

## Data Sources

This demo combines public Norwegian data with simulated VA operational data.

Public data planned for MVP:

- MET Norway Frost API: historical precipitation
- Kartverket grensedata / Geonorge kommunegrenser: municipality boundary and map context

Phase 2 optional data:

- SSB/KOSTRA through SSB PxWebApi: municipality water and wastewater context

Simulated VA data:

- pipe network
- measuring zones
- pump stations
- leakage incidents
- flow, pressure, pump runtime and alarms

No real sensitive VA infrastructure data is used.

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
- [Engineering guidelines](docs/engineering-guidelines.md)
- [Engineering decisions](docs/engineering-decisions.md)
- [External data sources](docs/external-data-sources.md)
- [Security checklist](docs/security-checklist.md)
- [Seed data plan](docs/seed-data.md)
- [UI screens](docs/ui-screens.md)
- [PDF report specification](docs/pdf-report.md)
- [Implementation checklist](docs/implementation-checklist.md)
- [Demo script in Norwegian](docs/demo-script-no.md)
- [Portfolio screenshots plan](docs/portfolio-screenshots.md)

## Current Status

The repository has completed the main backend workflow foundation and Phase 13 product upgrade work for water loss, private service cases, field tasks and monthly reporting.

Implemented so far:

- Monorepo foundation
- NestJS API with PostgreSQL/PostGIS and Prisma
- Seeded simulated VA dataset
- Water zones with estimated water loss and night flow trend
- Explainable leakage and fremmedvann scoring
- Demo dataset import and validation summary
- Recommendations API and status workflow
- Private service line cases API and UI workflow
- Field tasks API and UI workflow
- Monthly report endpoint and UI summary
- PDF risk report generation
- Next.js overview, map, leakage, fremmedvann, recommendations, data foundation and report screens
- Root `npm run dev` for local API + web startup

Next planned phase:

- UI polish, screenshots and PDF report content upgrade.

## Backend Workflow

The demo is intentionally backend-driven. The user flow is:

```text
Import -> Validate -> Analyze -> Explain -> Recommend -> Field work -> Report
```

Important API areas:

- `GET /api/overview`
- `GET /api/map/assets`
- `POST /api/import/demo-dataset`
- `GET /api/import/runs`
- `GET /api/water-zones`
- `GET /api/leakage/zones/:id`
- `GET /api/fremmedvann/pump-stations/:id/analysis`
- `GET /api/private-cases`
- `PATCH /api/private-cases/:id`
- `GET /api/field-tasks`
- `PATCH /api/field-tasks/:id`
- `GET /api/reports/monthly`
- `POST /api/reports/va-risk`

## Local Development

Prerequisites:

- Node.js 20.11 or newer
- npm
- Docker Desktop

Install dependencies:

```bash
npm install
```

Start the full local development environment:

```bash
npm run dev
```

This starts PostgreSQL/PostGIS, the API and the web app:

```text
API: http://localhost:3001
Web: http://localhost:3000
Swagger: http://localhost:3001/api/docs
```

PostgreSQL is exposed on local port `5433` to avoid conflicts with an existing local database.

To start only PostgreSQL/PostGIS:

```bash
docker compose up -d postgres
```

Run shared package typecheck:

```bash
npm run typecheck --workspace @va-drift-insight/shared
```

Run API tests:

```bash
npm run test --workspace @va-drift-insight/api
```

Run shared scoring tests:

```bash
npm run test --workspace @va-drift-insight/shared
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

Run only the web app:

```bash
$env:NEXT_PUBLIC_API_URL="http://localhost:3001"
npm run dev --workspace @va-drift-insight/web
```

Health checks:

```text
GET http://localhost:3001/api/health
GET http://localhost:3001/api/health/db
GET http://localhost:3001/api/version
```

OpenAPI/Swagger:

```text
http://localhost:3001/api/docs
```

Protected demo write endpoints use the `x-demo-api-key` header. For local development, the demo-only key is:

```text
local-demo-key
```

Example protected write request:

```bash
curl -X PATCH http://localhost:3001/api/recommendations/{id}/status \
  -H "Content-Type: application/json" \
  -H "x-demo-api-key: local-demo-key" \
  -d "{\"status\":\"planned\"}"
```

The web app is available at `http://localhost:3000` when `npm run dev` is running.

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

This project follows documented engineering guidelines covering architecture, security, testing, file size, validation, scoring explainability and data quality.

This demo uses simulated VA data inspired by realistic operational scenarios. No real municipal or sensitive infrastructure data is included.

Norwegian positioning:

Prosjektet kombinerer min praktiske bakgrunn som faglært VVS-installatør i Norge med backend-utvikling, databaser, API-er og kartbasert beslutningsstøtte. Målet er å vise hvordan feltforståelse kan omsettes til nyttige digitale verktøy for VA-drift.

Denne demoen bruker simulerte VA-data inspirert av realistiske driftssituasjoner. Ingen reelle kommunale eller sensitive infrastrukturdata er inkludert.
