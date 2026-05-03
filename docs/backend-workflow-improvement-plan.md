# Backend Workflow Improvement Plan

This plan moves VA Drift Insight from a visual dashboard demo toward a backend-driven VA operational intelligence workflow.

Current product signal:

- Strong domain concept
- Credible map foundation
- Real public data context through Kartverket and MET Frost fallback
- Explainable scoring and PDF generation exist

Main weakness to fix:

- The demo can still look static unless it clearly shows import, validation, scoring runs, persisted workflow changes and report generation from database data.

## Target Positioning

VA Drift Insight should be presented as:

> A mini VA data platform for operational decision support.

The product flow should be:

1. Import data
2. Validate data
3. Run scoring
4. Review risk areas
5. Create recommendations
6. Update recommendation status
7. Generate report

This is the flow that demonstrates backend development skill, not only dashboard design.

## Guiding Rule

Do not add many new screens just to increase feature count.

Add depth to:

- data ingestion
- validation
- database persistence
- scoring calculation
- recommendation workflow
- PDF reporting
- API visibility
- tests

## Phase A: Data Import And Validation

Goal:

Show that the system can ingest operational VA data, validate it and store results.

Backend endpoints:

- `POST /api/import/demo-dataset`
- `GET /api/import/runs`
- `GET /api/import/runs/:id`

Database additions:

- `import_runs`
- `import_validation_errors`

Import types:

- pipes GeoJSON
- pump stations GeoJSON
- incidents CSV
- time series CSV
- weather observations fallback/Frost

Import run response should include:

```json
{
  "id": "import-run-id",
  "status": "completed",
  "importType": "demo_dataset",
  "totalRows": 124,
  "acceptedRows": 118,
  "rejectedRows": 6,
  "warnings": 4,
  "durationMs": 842
}
```

Validation should catch:

- missing geometry
- invalid pipe material
- missing installed year
- invalid asset reference
- invalid timestamp
- invalid numeric range

Frontend:

- Add a compact `Dataimport` panel below the map or in a workflow section.
- Show latest import status, accepted/rejected rows and validation errors.

Acceptance criteria:

- Import run is stored in DB.
- Validation errors are stored and visible through API.
- Demo can show imported rows and rejected rows.
- Tests cover validation logic.

## Phase B: Scoring Runs

Goal:

Make scoring visible as a backend process, not hidden static data.

Backend endpoints:

- `POST /api/scoring/run`
- `GET /api/scoring/runs`
- `GET /api/scoring/runs/:id`

Database additions:

- `scoring_runs`
- optional `scoring_run_items`

Scoring run response:

```json
{
  "id": "scoring-run-id",
  "status": "completed",
  "assetCounts": {
    "pipes": 74,
    "zones": 6,
    "pumpStations": 5
  },
  "recommendationsGenerated": 4,
  "durationMs": 531
}
```

Scoring output must include concrete factors:

```json
{
  "score": 82,
  "confidence": 76,
  "factors": {
    "nightFlowIncreasePercent": 17,
    "averagePipeAge": 48,
    "previousLeaksNearby": 2,
    "rainfallCorrelation": 0.12
  }
}
```

Frontend:

- Add `Kjør risikoanalyse` button.
- Show latest scoring run summary.
- Show generated recommendations count.

Acceptance criteria:

- Scoring run recalculates scores from DB data.
- Results are persisted.
- Recommendations can be regenerated.
- Tests cover scoring service behavior.

## Phase C: Stronger Explanations

Goal:

Replace generic text with concrete, domain-specific explanations.

Leakage explanation should include:

- night flow increase percentage
- average pipe age
- percentage of old pipes
- previous leaks nearby
- pressure variation
- whether rainfall correlation is weak or strong

Example:

```text
Målesone Nord har 17 % økning i nattforbruk siste 14 dager sammenlignet med baseline.
62 % av ledningene i sonen er eldre enn 45 år. Det er registrert 2 tidligere
lekkasjer innen 300 meter. Det er ingen tydelig regnkorrelasjon, derfor vurderes
lekkasje som mer sannsynlig enn fremmedvann.
```

Fremmedvann explanation should include:

- dry weather baseline
- wet weather runtime increase
- delay after rainfall
- elevated flow duration
- high-level alarms
- recommended field methods

Acceptance criteria:

- Explanation is generated from calculated metrics.
- UI shows metrics and explanation.
- PDF uses the same concrete explanation.

## Phase D: Asset Detail API And Panel

Goal:

Show that the app has a domain model behind the map.

Backend endpoint:

- `GET /api/assets/:assetType/:id`

Response should include:

- asset identity
- type
- material / installed year / diameter where relevant
- zone/catchment
- geometry summary
- incidents
- time-series summary
- risk scores
- recommendations

Frontend:

- Replace large map popup dependency with a right-side or below-map `Asset profile` panel.
- Clicking a pipe, zone, pump station, node or incident loads details.

Acceptance criteria:

- Clicking a map asset fetches detail from API.
- Detail is not hardcoded in frontend.
- Empty states are handled.

## Phase E: Recommendation Lifecycle

Goal:

Turn recommendations into workflow, not only table rows.

Statuses:

- `new`
- `under_review`
- `planned`
- `completed`
- `closed`
- `dismissed`

Database additions:

- `recommendation_events`

Events:

- recommendation created by scoring run
- status changed
- comment added

Backend endpoints:

- `PATCH /api/recommendations/:id/status`
- `POST /api/recommendations/:id/comments`
- `GET /api/recommendations/:id/events`

Acceptance criteria:

- Status changes persist in DB.
- Event history is visible through API.
- UI shows at least latest event or full event list.

## Phase F: Serious PDF Report

Goal:

Make PDF feel like a report for a driftsleder.

Report sections:

1. Sammendrag
2. Kartutsnitt
3. Top 10 risikoområder
4. Lekkasjeindikasjoner
5. Fremmedvannindikasjoner with chart
6. Datakvalitet og datagap
7. Anbefalt feltplan next 14 days
8. Metode og scoring
9. Datakilder and limitations

Minimum improvements:

- top risk table
- methodology with formulas
- concrete field checks
- confidence and data basis
- data source note

Optional but high value:

- map screenshot/image
- fremmedvann chart image

Acceptance criteria:

- PDF is generated from DB/API data.
- PDF contains methodology and limitations.
- PDF includes concrete recommendations.

## Demo Story

The demo should show:

1. Open README and explain stack.
2. Start app with Docker/dev command.
3. Show Swagger/OpenAPI.
4. Show database tables/migrations.
5. Run import.
6. Show validation summary.
7. Run scoring.
8. Open map and risk explanation.
9. Change recommendation status.
10. Generate PDF report.
11. Run tests.

## Development Order

Recommended next implementation order:

1. Phase A: Import run database model and demo import endpoint
2. Phase B: Scoring run endpoint and persisted run summary
3. Phase C: Better explanations from concrete metrics
4. Phase D: Asset detail endpoint and panel
5. Phase E: Recommendation lifecycle events
6. Phase F: PDF report upgrade

This order gives the fastest improvement in perceived backend depth.

## Definition Of Done

Each phase is done only when:

- API endpoint exists
- input is validated
- database persistence exists where relevant
- frontend shows the workflow result
- tests cover important logic
- README/docs are updated
- change is committed and pushed
