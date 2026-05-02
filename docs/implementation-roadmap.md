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

## Week 4: Recommendations, PDF And Polish

Goal: presentable job-application demo.

Tasks:

- Implement recommendations service
- Implement status update
- Add recommendations table
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
4. PDF report
5. Data quality
6. CSV import
7. Cloud deployment
8. Auth
