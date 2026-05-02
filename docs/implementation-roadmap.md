# Implementation Roadmap

## Strategy

Build a small, complete and presentable product before adding optional features.

The MVP should be possible to run locally with Docker Compose. Cloud deployment is optional after the local demo works.

## Week 1: Foundation

Goal: backend, database, seed data and a simple map.

Tasks:

- Set up monorepo
- Set up NestJS API
- Set up Next.js frontend
- Set up Docker Compose
- Set up PostgreSQL with PostGIS
- Create Prisma schema
- Seed zones, pipes, pump stations and incidents
- Implement `GET /api/map/assets`
- Implement `GET /api/overview`
- Build overview screen with map and KPI cards

Result:

The app opens locally and shows a map, zones, pipe segments, pump stations and overview KPIs.

## Week 2: Leakage Scoring

Goal: complete leakage risk map.

Tasks:

- Implement leakage scoring service
- Calculate scores for zones and pipes
- Implement `GET /api/leakage/zones`
- Implement `GET /api/leakage/zones/:id`
- Add click interaction on map zones
- Show explanation and recommended action in side panel
- Add a simple data quality score

Result:

You can demonstrate where leakage control should be prioritized first, and why.

Demo sentence:

Her ser vi hvor lekkasjekontroll bør prioriteres først, og hvorfor.

## Week 3: Fremmedvann Analysis

Goal: rainfall response analysis for pump stations.

Tasks:

- Generate mock time-series for rainfall, pump runtime, flow and level
- Add high-level alarm incidents
- Implement fremmedvann scoring
- Implement `GET /api/fremmedvann/pump-stations`
- Implement `GET /api/fremmedvann/pump-stations/:id/analysis`
- Build rainfall and pump runtime chart
- Add anomaly markers
- Show explanation and recommended action

Result:

You can demonstrate how a pump station reacts to rainfall and how the system proposes upstream field investigations.

Demo sentence:

Pumpestasjonen reagerer på nedbør, og systemet foreslår feltundersøkelser oppstrøms.

## Week 4: Public Data Integration

Goal: make the demo more realistic by combining open Norwegian public data with simulated VA operational data.

MVP sources:

- MET Norway Frost API: real historical rainfall observations
- Kartverket grensedata / Geonorge kommunegrenser: real municipality boundary

Tasks:

- Add data-source labels in the UI
- Add `municipalities` table
- Add `weather_observations` table
- Add external data source metadata
- Add Frost client and service
- Add Kartverket/Geonorge boundary import path
- Add `GET /api/weather/rainfall`
- Add `POST /api/import/weather/frost`
- Add `GET /api/municipality`
- Add `GET /api/map/context`
- Update fremmedvann chart to show real rainfall + simulated pump response
- Update map to show real municipality boundary + simulated VA assets
- Add mocked service tests for external clients
- Add fallback seed data so local demo works without external API calls

Phase 2 source:

- SSB/KOSTRA municipality profile through SSB PxWebApi

Result:

The demo uses real Norwegian rainfall and real public map context while keeping VA operational data simulated and safe for a public portfolio.

Demo sentence:

Demoen bruker ekte norske nedborsdata og offentlige kommunegrenser,
kombinert med simulerte VA-driftsdata, for a vise beslutningsstotte
for lekkasjekontroll, fremmedvann og prioritering.

## Week 5: PDF And Polish

Goal: presentable job-application demo.

Tasks:

- Add CSV export if time allows
- Implement PDF report generation
- Write final README
- Add screenshots
- Add Norwegian demo script
- Optional cloud deployment

Result:

The project has a GitHub repo, local demo, optional live demo or video, PDF sample, README and interview pitch.

## Priority If Time Is Limited

1. Map and explainable leakage scoring
2. Fremmedvann chart
3. Recommendations
4. MET Frost rainfall integration
5. Kartverket municipality boundary
6. PDF report
7. Data quality
8. CSV import
9. SSB/KOSTRA municipality profile
10. Cloud deployment
11. Auth
