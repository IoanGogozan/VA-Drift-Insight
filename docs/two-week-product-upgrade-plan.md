# Two Week Product Upgrade Plan

This plan upgrades VA Drift Insight from a VA dashboard demo into a backend-driven demo product focused on leakage control, water loss and fremmedvann.

## Final Vision

Product name:

VA Drift Insight

Positioning:

VA Drift Insight - Vanntap & lekkasjekontroll + fremmedvann analyse

Main message:

Et praktisk beslutningsstøtteverktøy for lekkasjekontroll, vanntap og fremmedvann i kommunal VA-drift.

## Final Application Structure

Main navigation:

- Oversikt
- Lekkasjekontroll
- Fremmedvann
- Tiltak
- Rapporter
- Datagrunnlag

This navigation should make the product feel like an operational workflow, not a single dashboard.

## Product Flow

The final workflow should be:

1. Import data
2. Validate data
3. Analyze water loss and leakage risk
4. Analyze rainfall response and fremmedvann
5. Prioritize field tasks
6. Follow up private service line cases
7. Generate reports

Short form:

Data -> Analyse -> Score -> Tiltak -> Rapport

## Week 1: Backend, Logic And Structure

### Day 1: Refactor And Structure

Goal: make the application structure clearer and prepare room for new product areas.

Tasks:

- Keep existing NestJS modules but align naming with final product areas.
- Add planned module areas: water-loss, water-zones, private-cases, field-tasks, monthly-reports.
- Document which existing modules map to the new product menu.
- Avoid a large folder move until behavior is stable.

Recommended backend module structure:

```text
src/
  leakage/
  fremmedvann/
  recommendations/
  reports/
  imports/
  water-loss/
  water-zones/
  private-cases/
  field-tasks/
```

### Day 2: Water Zones

Goal: add water loss as a first-class feature.

Database: `water_zones`

- `id`
- `name`
- `total_consumption_m3_day`
- `night_flow_m3h`
- `baseline_night_flow_m3h`
- `estimated_loss_m3_day`
- `trend_7d`
- `trend_30d`
- `status`
- `geometry`
- `created_at`
- `updated_at`

Backend:

- `GET /api/water-zones`
- `GET /api/water-zones/:id`

Logic:

```text
estimated_loss_m3_day = max(0, current_night_flow - baseline_night_flow) * 24
night_flow_delta_percent = ((current_night_flow - baseline_night_flow) / baseline_night_flow) * 100
```

Status:

- `normal`: below 10 percent increase
- `suspect`: 10-20 percent increase
- `high`: above 20 percent increase

### Day 3: Leakage Scoring Upgrade

Goal: make leakage scoring more concrete and less generic.

New API output:

```json
{
  "score": 82,
  "confidence": 76,
  "factors": {
    "nightFlowIncreasePercent": 17,
    "avgPipeAge": 48,
    "previousLeaks": 2,
    "pressureVariation": 12,
    "customerComplaints": 3
  }
}
```

Add:

- trend logic
- night flow delta percent
- customer complaints
- previous leaks nearby
- stronger explanation text

Better explanation example:

```text
Målesone Nord har 17 % økning i nattforbruk siste 14 dager sammenlignet med baseline.
62 % av ledningene i sonen er eldre enn 45 år. Det er registrert 2 tidligere
lekkasjer innen 300 meter. Det er ingen tydelig regnkorrelasjon, derfor vurderes
lekkasje som mer sannsynlig enn fremmedvann.
```

### Day 4: Private Service Line Cases

Goal: show a real leakage control workflow including private stikkledninger.

Database: `private_service_cases`

- `id`
- `address`
- `zone_id`
- `status`
- `estimated_loss_m3_day`
- `created_at`
- `last_follow_up`
- `next_follow_up`

Statuses:

- `suspected` / Mistenkt
- `contacted` / Kontaktet
- `repaired` / Reparert
- `closed` / Lukket

API:

- `GET /api/private-cases`
- `PATCH /api/private-cases/:id`

### Day 5: Field Work List

Goal: turn recommendations into operational field tasks.

Database: `field_tasks`

- `id`
- `type`
- `zone_id`
- `priority`
- `reason`
- `suggested_method`
- `status`
- `last_checked`
- `created_at`
- `updated_at`

Suggested methods:

- Lytting
- Logger
- Ventilkontroll
- Måleroppfølging
- Kuminspeksjon
- CCTV
- Røyktest

API:

- `GET /api/field-tasks`
- `PATCH /api/field-tasks/:id`

### Day 6: Monthly Report Logic

Endpoint:

- `GET /api/reports/monthly`

Response:

```json
{
  "leaksFound": 4,
  "estimatedSavedM3": 320,
  "municipal": 3,
  "private": 1,
  "openCases": 5,
  "recommendedZones": ["Nord", "Sentrum"]
}
```

### Day 7: PDF Upgrade

Add to PDF:

- map snapshot or map section placeholder
- water zones table
- leakage section
- fremmedvann chart or chart summary
- private service line cases
- next actions
- methodology
- data limitations

## Week 2: UI, UX And Polish

### Day 8: Overview Redesign

New KPI cards:

- Estimert vanntap (m3/dag)
- Nattforbruk trend
- Høyrisiko soner
- Private lekkasjesaker
- Datakvalitet

### Day 9: Lekkasjekontroll Page

Table:

| Sone | Forbruk | Nattforbruk | Vanntap | Trend | Status |
| --- | --- | --- | --- | --- | --- |

Visual:

- green badge: normal
- orange badge: suspect
- red badge: high

### Day 10: Map Upgrade

Add:

- selected zone highlight
- risk zone overlay
- thicker/high-risk pipe styling
- dimmed basemap as default

Already implemented:

- Kartverket basemap
- VA pipe layers
- technical markers
- dempet/normal basemap toggle
- selected zone/pipe highlighting

### Day 11: Fremmedvann Polish

Chart improvements:

- two axes: nedbør and pumpetid
- dry weather baseline line
- anomaly highlight
- clearer delay response explanation

Analysis should show:

- dry weather baseline
- wet weather response
- delay after rainfall
- elevated flow duration
- high-level alarms
- confidence
- recommended field methods

### Day 12: Private Cases UI

Card/table:

| Adresse | Status | Estimert tap | Neste oppfølging |
| --- | --- | --- | --- |

Add:

- status badge
- status dropdown
- next follow-up date

### Day 13: Field Tasks UI

Top 10 field task list:

- Priority
- Area
- Reason
- Method
- Last checked
- Status

### Day 14: Final Polish

UI:

- spacing
- consistent typography
- consistent colors
- lucide icons

UX:

- loading states
- empty states
- error states
- mobile check

## First Page Copy

```text
Velkommen til VA Drift Insight

Dette er en demoapplikasjon som viser hvordan kommunale VA-data kan brukes
til praktisk beslutningsstøtte for lekkasjekontroll, vanntap og fremmedvann.

Formål

Målet er ikke å erstatte eksisterende driftskontrollsystemer, men å vise
hvordan data fra ledningsnett, målesoner, pumpestasjoner og nedbør kan
kombineres for å gi bedre grunnlag for prioritering i felt.

Hva kan du gjøre i denne demoen

- Se vannsoner med estimert vanntap og nattforbruk
- Identifisere områder med høy lekkasjerisiko
- Analysere regnrespons og fremmedvann i pumpestasjoner
- Følge opp private stikkledningssaker
- Prioritere feltarbeid basert på anbefalte tiltak
- Generere VA-risikorapporter

Viktig

Dette er en demo med simulerte VA-data.
Kartgrunnlag og nedbørsdata er basert på åpne norske datakilder.
Ingen reelle sensitive VA-infrastrukturdata er brukt.

Beslutningsstøtte, ikke automatisk diagnose.
```

## README English Copy

```text
VA Drift Insight is a demo application that shows how municipal water and
wastewater data can be used for practical decision support.

The application combines:
- GIS data
- rainfall data
- simulated operational data
- scoring and analysis

to support:
- leakage control
- water loss reduction
- fremmedvann analysis
- field work prioritization

The goal is not automation, but better decisions.
```

## Final Quality Checklist

Backend:

- REST API with clear modules
- PostgreSQL/PostGIS schema and migrations
- Prisma models for new domain entities
- Data import and validation workflow
- Scoring run workflow
- Status updates persisted in DB
- Tests for scoring, import validation and workflow services
- Swagger/OpenAPI visible

Frontend:

- Norwegian UI text
- Clear navigation
- Loading states
- Empty states
- Error states
- Map does not look cluttered
- Layer controls are understandable
- Recommendations and field tasks show workflow

Domain:

- Water loss is visible
- Leakage risk is explained with concrete metrics
- Fremmedvann analysis includes rainfall response logic
- Private service line cases are represented
- Field methods are realistic
- Reports include methodology and data limitations

Demo:

- Show app UI
- Show Swagger/OpenAPI
- Show database schema/migrations
- Show one API response
- Show scoring/import service code
- Run tests
- Generate PDF report

## Implementation Priority

Highest impact next steps:

1. Add water zones and water loss API.
2. Add leakage scoring upgrade with concrete metrics.
3. Add private service line cases.
4. Add field tasks.
5. Add navigation and split UI into product sections.
6. Upgrade PDF report.

Do not overbuild authentication, SaaS features or cloud deployment before the workflow is strong.
