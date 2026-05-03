# Engineering Guidelines

These guidelines define how VA Drift Insight should be built and maintained.

The application is a professional demo, but it should follow real production-minded engineering standards. Code quality matters almost as much as feature completeness because the project is meant to demonstrate how the developer thinks.

## Core Principles

- Keep the system simple and explainable.
- Prefer clear business logic over clever code.
- Make scoring transparent and auditable.
- Keep domain language consistent.
- Treat data quality as part of the product.
- Write code another developer can understand quickly.

## Project Structure

```text
va-drift-insight/
  apps/
    api/
    web/

  packages/
    shared/

  data/
    seed/

  docs/
    architecture.md
    domain-model.md
    scoring-methodology.md
    engineering-guidelines.md

  docker-compose.yml
  README.md
```

Rules:

- Backend logic stays in services, not controllers.
- Controllers only handle HTTP request/response.
- Scoring logic is isolated in scoring services.
- Shared types live in `packages/shared`.
- Demo data is versioned and documented.
- Frontend UI logic and backend domain logic stay separate.

## File Size Limits

These limits are guidelines, not hard blockers. If a file passes 300 lines, review whether it should be split.

Backend:

- Controller file: max 150 lines
- Service file: max 250-300 lines
- DTO file: max 150 lines
- Scoring function file: max 200 lines
- Utility file: max 150 lines
- Test file: max 300 lines
- Prisma schema: no strict limit, but models should stay readable

Frontend:

- Page component: max 200 lines
- Reusable component: max 150 lines
- Map component: max 250 lines
- Chart component: max 200 lines
- Table component: max 200 lines
- Hook file: max 150 lines

If a component grows too large, split it by responsibility:

```text
RiskMap.tsx
RiskMapLayer.tsx
RiskMapPopup.tsx
RiskLegend.tsx
RiskDetailsPanel.tsx
```

## Naming Conventions

Code is written in English:

- `calculateLeakageRisk`
- `getPumpStationAnalysis`
- `generateRiskReport`
- `createRecommendation`

Visible UI text is written in Norwegian:

- VA-risikooversikt
- Anbefalte tiltak
- Mistanke om fremmedvann
- Datakvalitet
- Generer VA-risikorapport

Use the same domain terms consistently:

- `leakage`
- `fremmedvann`
- `pumpStation`
- `pipe`
- `zone`
- `incident`
- `recommendation`
- `riskScore`
- `dataQuality`

Do not switch between `pumpStation`, `station`, `pump` and `ps` in code. Use `pumpStation`.

## Backend Rules

Controllers must stay thin.

Good:

```ts
@Get(":id/analysis")
async getAnalysis(@Param("id") id: string) {
  return this.fremmedvannService.getPumpStationAnalysis(id);
}
```

Avoid placing calculation logic directly in controllers.

Services contain application logic:

- `LeakageRiskService`
- `FremmedvannRiskService`
- `DataQualityService`
- `RecommendationService`
- `ReportService`

Every service should have one clear responsibility.

## DTO Validation

All API input must be validated.

Use:

- `class-validator`
- Zod for import boundaries where schema validation is clearer
- NestJS `ValidationPipe`

Rules:

- Never trust client input.
- Validate IDs, dates, enums and numeric ranges.
- Reject invalid CSV/import data early.
- Return clear validation errors.

Example:

```ts
export class UpdateRecommendationStatusDto {
  @IsEnum(RecommendationStatus)
  status: RecommendationStatus;
}
```

## Database Rules

PostgreSQL/PostGIS is the source of truth.

Rules:

- Use UUIDs for primary keys.
- Add indexes on foreign keys.
- Add indexes on frequently queried fields.
- Add spatial indexes on geometry columns.
- Use `created_at` and `updated_at` on main tables.
- Keep raw imported data separate from normalized data if needed.

Important indexes:

```sql
CREATE INDEX idx_pipes_zone_id ON pipes(zone_id);
CREATE INDEX idx_incidents_asset_id ON incidents(asset_id);
CREATE INDEX idx_time_series_asset_timestamp ON time_series(asset_id, timestamp);
CREATE INDEX idx_pipes_geometry ON pipes USING GIST(geometry);
CREATE INDEX idx_zones_geometry ON zones USING GIST(geometry);
```

Migration rules:

- Every schema change must be done through migration.
- Never manually edit a production database schema.
- Migration names should describe the change.
- Seed data should be reproducible.

## Security

Even as a demo, security should be treated seriously.

Environment rules:

- Never commit `.env` files.
- Commit only `.env.example`.
- Use strong generated secrets.
- Keep demo credentials clearly marked as demo-only.
- Never log secrets.

API rules:

- Restrict CORS to allowed frontend origins.
- Use `helmet` in NestJS.
- Add rate limiting for public endpoints.
- Validate all request bodies.
- Avoid exposing internal errors to users.
- Never return database connection details.

Demo authentication rules:

- A simple demo login is enough.
- Do not build complex user management.
- Use one demo user if authentication is added.
- Protect report generation and import endpoints.

Public demo endpoints:

- `GET /api/overview`
- `GET /api/map/assets`
- `GET /api/leakage/zones`
- `GET /api/fremmedvann/pump-stations`

Protected demo endpoints:

- `POST /api/import/*`
- `POST /api/reports/*`
- `PATCH /api/recommendations/:id/status`

## Input Security

For CSV and GeoJSON import:

- Limit file size.
- Validate file type.
- Validate required columns.
- Reject unknown dangerous content.
- Do not execute imported content.
- Sanitize strings before rendering in reports.

Recommended limits:

- CSV import max size: 10 MB
- PDF generation timeout: 30 seconds
- Max rows per import in demo: 50,000
- Max API page size: 500
- Default API page size: 50

## Error Handling

Use structured error responses.

Rules:

- Log technical details on the server.
- Return user-friendly messages to the frontend.
- Include request ID in logs if possible.
- Never expose raw Prisma errors in the UI.

Example response:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid pipe material value.",
  "details": {
    "field": "material",
    "allowedValues": ["PVC", "PE", "støpejern", "duktilt_støpejern", "betong"]
  }
}
```

UI message example:

```text
Kunne ikke laste risikodata. Prøv igjen eller sjekk datagrunnlaget.
```

## Logging

Logging should help debugging without creating noise.

Log:

- Imports
- Scoring runs
- Report generation
- Validation failures
- Recommendation status updates

Do not log:

- Secrets
- Full CSV content
- Personal data unless necessary

Useful event names:

- `IMPORT_STARTED`
- `IMPORT_COMPLETED`
- `IMPORT_FAILED`
- `SCORING_STARTED`
- `SCORING_COMPLETED`
- `PDF_REPORT_GENERATED`
- `RECOMMENDATION_STATUS_UPDATED`

Example:

```json
{
  "event": "SCORING_COMPLETED",
  "scoreType": "leakage",
  "assetCount": 124,
  "durationMs": 842
}
```

## Testing

Do not overbuild tests for the demo, but test important logic well.

Priority:

1. Scoring logic
2. Recommendation generation
3. Data quality calculation
4. API validation
5. Report generation basics

Coverage targets:

- Overall: 60-70%
- Scoring services: 90%+
- Controllers: basic tests only
- Frontend visual components: light testing

Do not chase artificial coverage. Prefer strong tests on important logic.

Concrete test cases:

- High leakage risk for old pipe with previous breaks and night flow anomaly
- Medium leakage risk for old pipe without sensor anomaly
- Lower confidence when installed year is missing
- Score never above 100 or below 0
- High fremmedvann suspicion when pump runtime increases after rainfall
- Low fremmedvann suspicion when pump runtime is stable during rainfall
- Delayed response after rainfall is detected
- Overflow events increase fremmedvann score
- Missing rainfall data lowers confidence
- Missing pipe age lowers data quality
- Missing sensor data lowers data quality
- Complete geometry, material, age and incident history raises data quality

## Frontend Rules

Rules:

- Keep components small.
- Separate data fetching from presentation.
- Use typed API responses.
- Avoid hardcoded API URLs.
- Keep Norwegian UI labels in one place where practical.
- Add loading, empty and error states for every API call.
- Clear selected asset state on map when appropriate.

Recommended structure:

```text
components/
  overview/
    KpiCard.tsx
    OverviewMap.tsx
    PriorityList.tsx

  leakage/
    LeakageRiskMap.tsx
    LeakageDetailsPanel.tsx
    RiskFactorList.tsx

  fremmedvann/
    PumpStationChart.tsx
    FremmedvannExplanation.tsx

  recommendations/
    RecommendationsTable.tsx
    PriorityBadge.tsx
```

Norwegian UI state text:

- Laster risikodata...
- Ingen anbefalte tiltak funnet.
- Kunne ikke hente pumpestasjonsdata.
- Velg en sone på kartet for å se detaljer.

## Performance

Avoid obvious performance mistakes.

Backend:

- Use pagination on large lists.
- Do not return all time-series data by default.
- Limit time range for charts.
- Add database indexes.
- Cache overview data if calculation becomes slow.

Frontend:

- Do not render thousands of map features unnecessarily.
- Use simplified GeoJSON for demo.
- Fetch details only when an asset is selected.
- Keep charts limited to relevant time periods.

Recommended limits:

- Map assets demo: max 1,000-3,000 features
- Chart points visible: max 500
- Recommendations page size: 50
- Time-series default range: 30 days

## PDF Generation

PDF reporting is a core feature.

Rules:

- Generate PDF from a clean HTML template.
- Keep report output deterministic.
- Include generation date.
- Include methodology.
- Include data confidence.
- Do not claim certainty where data is weak.

Use careful Norwegian wording:

- Mistanke om fremmedvann
- Indikasjon på lekkasjerisiko
- Anbefalt feltkontroll
- Datagrunnlaget har begrensninger

Avoid:

- Leak detected
- Failure guaranteed
- AI confirmed

## Scoring

Risk scoring must be explainable.

Rules:

- Every score has factor breakdown.
- Every score has explanation.
- Every score has confidence.
- Formula logic is documented.
- Methodology stays in `docs/scoring-methodology.md`.

A risk score without explanation is not enough.

## Data Quality

Missing data is part of the product.

Rules:

- Missing data reduces confidence.
- Unknown material should not automatically mean high risk.
- Unknown installation year should be visible.
- Data gaps should create recommendations.

Example recommendation:

```text
Type: Data gap
Priority: Medium
Reason: 42 % of pipes in the zone are missing installation year.
Suggested action: Update pipe register or verify data during planned inspection.
```

## Imports

For CSV and GeoJSON imports:

- Validate schema before saving.
- Show import summary.
- Count accepted rows.
- Count rejected rows.
- Store validation errors.
- Do not silently ignore bad data.

Example import summary:

```json
{
  "importType": "pipes",
  "totalRows": 1200,
  "acceptedRows": 1168,
  "rejectedRows": 32,
  "errors": [
    {
      "row": 44,
      "field": "installed_year",
      "message": "Invalid year"
    }
  ]
}
```

## Type Safety

Rules:

- Use TypeScript strict mode.
- Avoid `any`.
- Define shared API response types.
- Use enums or literal union types for status, priority and asset type.
- Validate external data at boundaries.

## Comments

Do not comment everything. Comment where domain logic needs explanation.

Good:

```ts
// Wet weather response is checked with a delay because infiltration/inflow
// may reach the pump station several hours after rainfall starts.
```

Bad:

```ts
// Add two numbers
const total = a + b;
```

## Git Practices

Suggested branches:

- `main`
- `develop`
- `feature/leakage-scoring`
- `feature/fremmedvann-analysis`
- `feature/reporting`
- `fix/import-validation`

Use clear commit messages:

- `Add leakage risk scoring service`
- `Create pump station rainfall analysis endpoint`
- `Add recommendations table`
- `Fix CSV import validation`
- `Generate VA risk PDF report`

Avoid:

- `fix stuff`
- `update`
- `changes`
- `final version`

After each completed feature:

- Run relevant tests.
- Run typecheck and build.
- Commit with a clear message.
- Push the branch when a remote is configured.

## Pull Request Checklist

Even when working alone, use this checklist mentally:

- Does the code compile?
- Are important paths tested?
- Are API inputs validated?
- Are errors handled?
- Are names clear?
- Is the file too large?
- Is domain logic documented?
- Does the UI have loading/error states?
- Does this change improve the demo story?

## Accessibility And UI Quality

Rules:

- Use readable contrast.
- Do not rely only on colors for risk.
- Add labels to charts.
- Add tooltips for risk factors.
- Use Norwegian text consistently.
- Use clear empty states.

For risk, use color and text:

- Høy risiko
- Medium risiko
- Lav risiko

## Observability

Minimum observability for the demo:

- Health endpoint
- Version endpoint
- Basic request logging
- Scoring duration logs when scoring is implemented

Endpoints:

- `GET /api/health`
- `GET /api/version`

Example version response:

```json
{
  "status": "ok",
  "service": "va-drift-insight-api",
  "version": "1.0.0"
}
```

## Demo Realism

Do not present simulated data as real data.

English:

```text
This demo uses simulated VA data inspired by realistic operational scenarios.
No real municipal or sensitive infrastructure data is included.
```

Norwegian:

```text
Denne demoen bruker simulerte VA-data inspirert av realistiske driftssituasjoner.
Ingen reelle kommunale eller sensitive infrastrukturdata er inkludert.
```

## Definition Of Done

A feature is done only when:

- It works locally with Docker.
- API input is validated.
- Error state is handled.
- Important logic is tested.
- UI text is Norwegian.
- Code is English.
- README/docs are updated if needed.
- No file is unnecessarily large.
- No secrets or sensitive data are committed.

## Short Version For The App

VA Drift Insight is built with the following engineering principles:

1. Simple and explainable architecture
2. Clear separation between API, domain logic and UI
3. PostgreSQL/PostGIS as the source of truth
4. Transparent and auditable risk scoring
5. Input validation on all API boundaries
6. No secrets in source code
7. Test coverage for scoring and recommendation logic
8. Norwegian UI language, English codebase
9. Clear error handling and user-friendly messages
10. Data quality and uncertainty shown explicitly
11. Simulated demo data only, no sensitive infrastructure data
12. Reports must support practical VA decision-making
