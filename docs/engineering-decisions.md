# Engineering Decisions

This document captures project-level decisions that affect implementation direction.

## ADR 001: Use Rule-Based Explainable Scoring First

Status: Accepted

Decision:

Use transparent scoring formulas instead of ML for this demo.

Reason:

The demo should show practical VA decision support. Operational users need to understand why an area is prioritized, and simulated data is not a good basis for a real ML model.

Implication:

Every score must include factor breakdown, explanation and confidence.

## ADR 002: Use PostgreSQL/PostGIS As Source Of Truth

Status: Accepted

Decision:

Use PostgreSQL with PostGIS for geometry and operational data.

Reason:

VA Drift Insight is map- and asset-centered. Keeping geometry in the database makes API queries and future spatial scoring more realistic.

Implication:

Geometry columns need spatial indexes. Map endpoints should return GeoJSON generated from PostGIS.

## ADR 003: Code In English, UI In Norwegian

Status: Accepted

Decision:

Use English for code, comments, commits and public repository documentation. Use Norwegian for visible application text.

Reason:

This keeps the codebase readable for international developers while making the product feel relevant for Norwegian VA operations.

Implication:

Domain constants can provide Norwegian labels, but business logic names stay English.

## ADR 004: Demo Data Must Be Clearly Simulated

Status: Accepted

Decision:

Use simulated VA data only.

Reason:

The demo should not expose real municipal infrastructure, SCADA data, incidents or sensitive map details.

Implication:

README, docs, UI copy and report copy must state clearly that the dataset is simulated.

## ADR 005: Align Early Schema With UUIDs

Status: Accepted

Decision:

Use UUID primary keys in Prisma/PostgreSQL.

Reason:

UUIDs are a better default for a production-minded API and match the engineering guidelines.

Implication:

Even when seed data uses fixed IDs for readability, generated records should use UUID defaults.

## ADR 006: Return To Stable Next.js Before Deployment

Status: Accepted (supersedes the temporary canary decision)

Decision:

Use the pinned stable Next.js release for CI and deployment. The temporary
`next@16.3.0-canary.8` dependency was replaced by stable `next@16.3.2` when the
patched stable release became available.

Reason:

Portfolio deployment should not depend on a canary runtime when a patched
stable release is available.

Implication:

Next.js, React, and React DOM are pinned to reviewed stable versions and updated
through an explicit dependency change with CI validation.

## ADR 007: Use Public Norwegian Data, Simulate Sensitive VA Operations

Status: Accepted

Decision:

Use MET Norway Frost API and Kartverket grensedata / Geonorge kommunegrenser for public context. Keep SSB/KOSTRA as an optional contextual integration. Continue simulating VA operational data.

Reason:

Real rainfall and official municipality boundaries make the demo credible, while real pipe networks, pump station data, incidents, alarms and SCADA data are sensitive and not suitable for a public portfolio project.

Implication:

The UI, README and PDF reports must clearly label which data is public/open and which data is simulated. The app must keep working with fallback seed data when external APIs or credentials are unavailable.

## ADR 008: Deploy The Portfolio Demo On The Norvix Home Server

Status: Accepted

Decision:

Deploy the public demo at `https://va.norvix.no` through the existing shared
Caddy edge. Run web, API, migrations, and PostGIS with Docker Compose. Use a
repository-specific self-hosted GitHub Actions runner for manual, main-only
deployments.

Reason:

This reuses the established Norvix server topology, keeps SSH private to the
home LAN, avoids exposing application and database ports, and makes the
portfolio release process reproducible.

Implication:

The repository owns Dockerfiles, the home-server Compose file, Caddy site
fragment, CI, deploy workflow, smoke test, and operational runbook. Server
secrets remain only in `/srv/projects/va-drift-insight/.env`. The deployment
accepts simulated data only and must not be presented as a production VA
operations system.
