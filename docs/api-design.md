# API Design

Base path:

```text
/api
```

## Overview

### GET /api/overview

Returns KPIs and top recommendations.

Example response:

```json
{
  "kpis": {
    "highRiskLeakageZones": 3,
    "fremmedvannSuspicions": 2,
    "activeAnomalies": 6,
    "recommendedFieldChecks": 8,
    "dataCompletenessScore": 72
  },
  "topRecommendations": []
}
```

## Map

### GET /api/map/assets

Returns GeoJSON for zones, pipes and pump stations.

Example response:

```json
{
  "type": "FeatureCollection",
  "features": []
}
```

## Leakage Risk

### GET /api/leakage/zones

Returns leakage score summaries for all water meter zones.

### GET /api/leakage/zones/:id

Returns detailed leakage analysis for one zone.

Example response:

```json
{
  "zoneId": "zone-north",
  "name": "Målesone Nord",
  "riskScore": 82,
  "confidence": 76,
  "factors": {
    "pipeAge": 87,
    "material": 70,
    "historicalBreaks": 80,
    "nightFlowAnomaly": 88,
    "pressureVariation": 60,
    "criticality": 65
  },
  "explanation": "Risikoen er høy fordi nattforbruket har økt, flere ledninger er eldre enn 45 år, og det finnes tidligere lekkasjer i nærheten.",
  "recommendedAction": "Gjennomfør akustisk lekkasjesøk i gate X/Y og ventilkontroll ved node V-14."
}
```

## Fremmedvann

### GET /api/fremmedvann/pump-stations

Returns fremmedvann score summaries for pump stations.

### GET /api/fremmedvann/pump-stations/:id/analysis

Returns rainfall response analysis, chart data, explanation and recommended action.

## Recommendations

### GET /api/recommendations

Returns all recommendations.

Recommended query params:

- `priority`
- `type`
- `status`

### PATCH /api/recommendations/:id/status

Updates recommendation status.

Example request:

```json
{
  "status": "planned"
}
```

## Reports

### POST /api/reports/va-risk

Generates a VA risk PDF report.

### GET /api/reports/:id/download

Downloads a generated report.

## Imports

### POST /api/import/pipes

Imports pipe data.

### POST /api/import/time-series

Imports operational time-series data.

### POST /api/import/incidents

Imports incidents.

Import endpoints are optional for the first MVP. Seed data is enough for the first demo.
