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

- [ ] Create NestJS app in `apps/api`
- [ ] Add Prisma
- [ ] Configure database connection
- [ ] Add PostGIS extension migration
- [ ] Create Prisma schema for MVP tables
- [ ] Add seed script
- [ ] Add Swagger/OpenAPI
- [ ] Add health endpoint

## Phase 3: Seed Data

- [ ] Create Fjordvik kommune zones
- [ ] Create water pipe segments
- [ ] Create wastewater and stormwater pipe segments
- [ ] Create pump stations
- [ ] Create incident data
- [ ] Create time-series mock data
- [ ] Verify seeded geometry can be returned as GeoJSON

## Phase 4: Core API

- [ ] Implement `GET /api/overview`
- [ ] Implement `GET /api/map/assets`
- [ ] Implement `GET /api/leakage/zones`
- [ ] Implement `GET /api/leakage/zones/:id`
- [ ] Implement `GET /api/fremmedvann/pump-stations`
- [ ] Implement `GET /api/fremmedvann/pump-stations/:id/analysis`
- [ ] Implement `GET /api/recommendations`
- [ ] Implement `PATCH /api/recommendations/:id/status`

## Phase 5: Scoring

- [ ] Implement shared scoring constants
- [ ] Implement leakage scoring
- [ ] Implement fremmedvann scoring
- [ ] Implement data quality scoring
- [ ] Store score explanations
- [ ] Add unit tests for scoring functions

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
