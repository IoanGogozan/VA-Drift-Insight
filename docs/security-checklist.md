# Security Checklist

Use this checklist before adding import, reporting, authentication or deployment features.

## Environment

- [x] `.env` is ignored by Git
- [x] `.env.example` exists
- [x] Demo credentials are clearly marked as demo-only in `.env.example`
- [ ] Strong generated secrets are used outside local development
- [ ] No secrets are printed in logs

## API

- [x] ValidationPipe is enabled
- [x] Helmet is enabled
- [x] Rate limiting is enabled
- [x] CORS is restricted through environment configuration
- [ ] Structured error responses are implemented
- [ ] Internal errors are not exposed to frontend users
- [ ] Request logging avoids secrets and sensitive data

## Protected Endpoints

These endpoints should require demo authentication before they are implemented:

- [ ] `POST /api/import/*`
- [ ] `POST /api/reports/*`
- [x] `PATCH /api/recommendations/:id/status`

These endpoints can remain public in the demo:

- [x] `GET /api/overview`
- [x] `GET /api/map/assets`
- [ ] `GET /api/leakage/zones`
- [ ] `GET /api/fremmedvann/pump-stations`

## Imports

- [ ] CSV max size is 10 MB
- [ ] Max rows per import is 50,000
- [ ] File type is validated
- [ ] Required columns are validated
- [ ] Rejected rows are counted and returned
- [ ] Imported strings are sanitized before report rendering

## PDF Generation

- [ ] PDF generation timeout is 30 seconds
- [ ] Report generation endpoint is protected
- [ ] Reports include generation date
- [ ] Reports include methodology and confidence
- [ ] Reports avoid certainty claims when data is weak

## Demo Data

- [x] Demo data is simulated
- [x] No real municipal data is included
- [x] No sensitive infrastructure data is included
- [ ] UI clearly states that the dataset is simulated
- [x] README clearly states that the dataset is simulated
