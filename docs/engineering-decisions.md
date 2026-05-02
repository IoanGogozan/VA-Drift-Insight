# Engineering Decisions

This document captures project-level decisions that affect implementation direction.

## ADR 001: Use Rule-Based Explainable Scoring First

Status: Accepted

Decision:

Use transparent scoring formulas instead of ML for the MVP.

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

Use English for code, comments and commits. Use Norwegian for visible UI text and demo script.

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

README, docs and later UI/report copy must state clearly that the dataset is simulated.

## ADR 005: Align Early Schema With UUIDs

Status: Accepted

Decision:

Use UUID primary keys in Prisma/PostgreSQL.

Reason:

UUIDs are a better default for a production-minded API and match the engineering guidelines.

Implication:

Even when seed data uses fixed IDs for readability, generated records should use UUID defaults.
