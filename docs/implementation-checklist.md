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

Last completed phase verified: Phase 9 PDF report.

- [x] Run shared scoring tests
- [x] Run shared typecheck
- [x] Run shared build
- [x] Run API tests
- [x] Run API typecheck
- [x] Run API build
- [x] Run web typecheck
- [x] Run web build
- [x] Run runtime smoke test
- [x] Commit completed phase
- [x] Push branch when a Git remote is configured

## Phase 6: Frontend Foundation

- [x] Create Next.js app in `apps/web`
- [x] Add Tailwind CSS
- [x] Add shadcn/ui
- [x] Add API client
- [x] Add base layout
- [x] Add Norwegian UI text constants

## Phase 7: Screens

- [x] Build `VA-risikooversikt`
- [x] Build map layers for zones, pipes and pump stations
- [x] Build `Hvor bør vi lete først?`
- [x] Build leakage detail panel
- [x] Build `Regn vs pumpestasjon`
- [x] Build rainfall and pump runtime chart
- [x] Build `Anbefalte tiltak`
- [x] Add recommendation status updates

## Phase 8: Public Data Integration

- [x] Add `docs/external-data-sources.md`
- [x] Add `FROST_CLIENT_ID` to `.env.example`
- [x] Add `municipalities` database model/table
- [x] Add `weather_observations` database model/table
- [x] Add optional `external_data_sources` metadata model/table
- [x] Add seeded fallback municipality boundary
- [x] Add seeded fallback rainfall observations
- [x] Add MET Frost client
- [x] Add MET Frost service
- [x] Add `GET /api/weather/rainfall`
- [x] Add protected `POST /api/import/weather/frost`
- [x] Add Kartverket/Geonorge boundary import path
- [x] Add `GET /api/municipality`
- [x] Add `GET /api/map/context`
- [x] Update fremmedvann chart to use Frost rainfall when available
- [x] Update map to show municipality boundary
- [x] Add `Datakilder` card to overview
- [x] Add mocked unit tests for external data clients/services
- [x] Verify app works without external API credentials by using fallback seed data
- [x] Keep SSB/KOSTRA out of MVP and document it as Phase 2

## Phase 9: PDF Report

- [x] Create report HTML template
- [x] Add Puppeteer PDF service
- [x] Implement `POST /api/reports/va-risk`
- [x] Implement `GET /api/reports/:id/download`
- [x] Add frontend report button
- [ ] Add sample generated PDF to demo material if appropriate

## Phase 10: Professional GIS Map Experience

- [x] Replace static SVG map with interactive map component
- [x] Use Kartverket topo basemap as the operational map background
- [x] Add layer control for kommunegrense, målesoner, vannledninger, avløpsledninger, overvannsledninger, pumpestasjoner and hendelser
- [x] Expand simulated pipe network to a more realistic connected network
- [x] Add clear styling for water, wastewater and stormwater pipes
- [x] Add smaller, more technical pump station symbols/icons
- [x] Add selected asset highlight
- [x] Add useful popup or side-panel handoff for selected map assets
- [x] Keep public basemap/geodata clearly separated from simulated VA data
- [x] Verify desktop and mobile map screenshots with Playwright

Acceptance criteria:

- The map should look like a credible VA/GIS operational view, not a decorative diagram.
- Simulated pipes should appear as connected network segments placed in a plausible urban pattern.
- Pump stations should use technical symbols and should not dominate the map visually.
- The user should understand what each layer represents without reading documentation.

## Phase 11: Polish

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
- Real rainfall data can be imported from MET Frost or loaded from fallback seed data
- Real municipality boundary can be shown from Kartverket/Geonorge data or fallback seed data
- UI clearly separates public data sources from simulated VA data
- PDF report can be generated
- README explains purpose, stack and how to run the project
