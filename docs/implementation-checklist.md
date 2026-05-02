# Implementation Checklist

Use this checklist as the main build guide. Keep each step small enough to test before moving forward.

## Phase 1: Repository Foundation

- [x] Initialize Git repository
- [x] Create monorepo folder structure
- [x] Add root `package.json`
- [x] Add shared TypeScript package
- [x] Add Docker Compose with PostGIS
- [x] Add root `.env.example`
- [x] Add basic README run instructions

## Phase 2: Backend Foundation

- [x] Create NestJS app in `apps/api`
- [x] Add Prisma
- [x] Configure database connection
- [x] Add PostGIS extension migration
- [x] Create Prisma schema for MVP tables
- [x] Add seed script
- [x] Add Swagger/OpenAPI
- [x] Add health endpoint
- [x] Add version endpoint
- [x] Enable Helmet
- [x] Enable API rate limiting
- [x] Restrict CORS through environment configuration

## Phase 3: Seed Data

- [x] Create Fjordvik kommune zones
- [x] Create water pipe segments
- [x] Create wastewater and stormwater pipe segments
- [x] Create pump stations
- [x] Create incident data
- [ ] Create time-series mock data
- [x] Verify seeded geometry can be returned as GeoJSON

## Phase 4: Core API

- [x] Implement `GET /api/overview`
- [x] Implement `GET /api/map/assets`
- [x] Implement `GET /api/leakage/zones`
- [x] Implement `GET /api/leakage/zones/:id`
- [x] Implement `GET /api/fremmedvann/pump-stations`
- [x] Implement `GET /api/fremmedvann/pump-stations/:id/analysis`
- [x] Implement `GET /api/recommendations`
- [x] Implement `PATCH /api/recommendations/:id/status`
- [x] Add unit tests for current API services and guards

## Phase 5: Scoring

- [x] Implement shared scoring constants
- [x] Implement leakage scoring
- [x] Implement fremmedvann scoring
- [x] Implement data quality scoring
- [ ] Store score explanations
- [x] Add unit tests for scoring functions

## Verification After Each Phase

Last completed phase verified: Phase 5 scoring.

- [x] Run shared scoring tests
- [x] Run shared typecheck
- [x] Run shared build
- [x] Run API tests
- [x] Run API typecheck
- [x] Run API build
- [x] Run runtime smoke test
- [x] Commit completed phase
- [x] Push branch when a Git remote is configured

## Phase 6: Frontend Foundation

- [ ] Create Next.js app in `apps/web`
- [ ] Add Tailwind CSS
- [ ] Add shadcn/ui
- [ ] Add API client
- [ ] Add base layout
- [ ] Add Norwegian UI text constants

## Phase 7: Screens

- [ ] Build `VA-risikooversikt`
- [ ] Build map layers for zones, pipes and pump stations
- [ ] Build `Hvor bør vi lete først?`
- [ ] Build leakage detail panel
- [ ] Build `Regn vs pumpestasjon`
- [ ] Build rainfall and pump runtime chart
- [ ] Build `Anbefalte tiltak`
- [ ] Add recommendation status updates

## Phase 8: PDF Report

- [ ] Create report HTML template
- [ ] Add Puppeteer PDF service
- [ ] Implement `POST /api/reports/va-risk`
- [ ] Implement `GET /api/reports/:id/download`
- [ ] Add frontend report button
- [ ] Add sample generated PDF to demo material if appropriate

## Phase 9: Polish

- [ ] Add screenshots
- [ ] Improve README run instructions
- [ ] Add demo script link
- [ ] Add architecture diagram to README if useful
- [ ] Verify Docker local startup from clean checkout
- [ ] Record optional demo video

## Definition Of Done For MVP

- App runs locally with Docker Compose
- Overview screen loads real seeded data from API
- Map shows zones, pipes and pump stations
- Leakage score has factors, explanation and recommended action
- Fremmedvann screen shows rainfall response and explanation
- Recommendations table supports status updates
- PDF report can be generated
- README explains purpose, stack and how to run the project
