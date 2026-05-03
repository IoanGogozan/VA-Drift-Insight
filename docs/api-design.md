# API Design

Base path:

```text
/api
```

Swagger/OpenAPI is available locally at:

```text
http://localhost:3001/api/docs
```

## Health And Version

### GET /api/health

Returns API health status.

### GET /api/health/db

Checks database connectivity.

### GET /api/version

Returns service name and version.

## Overview

### GET /api/overview

Returns dashboard KPIs and top recommendations.

## Map

### GET /api/map/assets

Returns simulated VA assets as GeoJSON:

- water zones
- pipes
- pump stations
- incidents
- network nodes

### GET /api/map/context

Returns public map context, including municipality boundary when available.

## Water Zones

### GET /api/water-zones

Returns water zones with consumption, night flow, baseline, estimated water loss, trend and status.

### GET /api/water-zones/:id

Returns one water zone.

## Leakage Control

### GET /api/leakage/zones

Returns leakage score summaries for water meter zones.

### GET /api/leakage/zones/:id

Returns detailed leakage analysis for one zone.

The response includes:

- risk score
- confidence
- factor breakdown
- night flow increase
- estimated water loss
- previous leaks
- open private cases
- recommended field method
- explanation
- recommended action

## Fremmedvann

### GET /api/fremmedvann/pump-stations

Returns fremmedvann score summaries for pump stations.

### GET /api/fremmedvann/pump-stations/:id/analysis

Returns rainfall response analysis, chart data, dry/wet metrics, explanation and recommended action.

## Private Service Cases

### GET /api/private-cases

Returns private service line leakage cases.

Optional query parameter:

- `status`

### PATCH /api/private-cases/:id

Updates status, estimated loss or follow-up dates for a private case.

This is a protected demo write endpoint. Send the `x-demo-api-key` header in local development.

## Field Tasks

### GET /api/field-tasks

Returns prioritized field tasks.

Optional query parameters:

- `priority`
- `status`

### PATCH /api/field-tasks/:id

Updates field task status and optional last checked date.

This is a protected demo write endpoint.

## Recommendations

### GET /api/recommendations

Returns operational recommendations.

Optional query parameters:

- `priority`
- `type`
- `status`

### PATCH /api/recommendations/:id/status

Updates recommendation status.

This is a protected demo write endpoint.

## Imports

### POST /api/import/demo-dataset

Runs demo dataset validation and stores an import run with validation findings.

This is a protected demo write endpoint.

### GET /api/import/runs

Returns recent import runs and validation errors.

### GET /api/import/runs/:id

Returns one import run.

### POST /api/import/weather/frost

Imports rainfall observations from MET Norway Frost when credentials are configured.

This is a protected demo write endpoint.

## Weather

### GET /api/weather/rainfall

Returns rainfall observations for the demo municipality or fallback seed data.

## Municipality

### GET /api/municipality

Returns selected municipality metadata and boundary data.

## Reports

### GET /api/reports/monthly

Returns operational monthly summary for leakage, private cases and field tasks.

### POST /api/reports/va-risk

Generates a VA demo PDF report.

This is a protected demo write endpoint.

### GET /api/reports/:id/download

Downloads a generated report.
