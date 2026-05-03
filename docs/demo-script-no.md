# Demo Script In Norwegian

Use this script for job applications, interviews, portfolio walkthroughs and short demo videos.

## 90-Second Interview Script

Jeg har laget VA Drift Insight som et porteføljeprosjekt for å vise hvordan jeg tenker rundt lekkasjekontroll, vannsoner, vanntap og datadrevet feltoppfølging.

Demoen bruker simulerte VA-data. Målet er ikke å lage et ferdig produksjonssystem eller erstatte fagfolk, men å vise hvordan praktisk VVS-/VA-forståelse kan kombineres med backend, databaser, kart og rapportering.

Her ser vi først en oversikt over vannsoner, estimert vanntap, nattforbrukstrend, private lekkasjesaker og åpne feltoppgaver.

I vannsonetabellen sammenlignes nattforbruk med baseline. Når nattforbruket øker, estimerer systemet mulig vanntap og gir sonen en status som normal, mistenkt eller høy risiko.

I lekkasjekartet kan vi velge en sone. Forklaringen viser konkrete faktorer: økning i nattforbruk, estimert vanntap i kubikkmeter per døgn, tidligere lekkasjer, kundemeldinger, åpne private saker og anbefalt metode for feltkontroll.

Systemet konkluderer ikke automatisk. Det foreslår neste praktiske steg, for eksempel loggerutplassering, lytting, ventilkontroll eller måleroppfølging.

Private stikkledninger vises som egne saker fordi lekkasjekontroll også handler om kontakt, oppfølging, dokumentasjon og lukking av saker.

Feltoppgaver viser hvordan analysen blir til en operativ arbeidsliste for drift: prioritet, område, årsak, metode og status.

Til slutt kan systemet generere en demo-rapport med vannsoner, feltplan, private saker, datagap, metode og scoring. Rapporten kan brukes som beslutningsgrunnlag i møte eller planlegging.

For meg viser dette hvordan jeg ønsker å jobbe: i skjæringspunktet mellom feltforståelse, VA-drift og digitale verktøy.

## Short Pitch

Jeg kan koble praktisk VVS-/VA-erfaring med backend, databaser, kart, rapportering og datadrevet lekkasjekontroll.

## Very Short Pitch

Jeg kan være personen som kobler felt, drift og data.

## Technical Walkthrough

If the interviewer wants technical details, show these parts:

1. Open the application and show the workflow strip:
   `Datagrunnlag -> Analyse -> Forklaring -> Feltoppfølging -> Rapport`.

2. Show the API in Swagger:
   `http://localhost:3001/api/docs`

3. Show one API response:
   `GET /api/leakage/zones/:id`

4. Explain the backend structure:
   NestJS modules, services, DTO validation, Prisma and PostgreSQL/PostGIS.

5. Show the scoring service:
   leakage scoring is rule-based and explainable, not black-box AI.

6. Show tests:
   scoring, services, imports, reports and guards have automated tests.

7. Show the generated PDF:
   water zones, field tasks, private cases, data gaps and methodology.

## What To Say Clearly

This is a portfolio demo:

```text
Dette er ikke et system som skal brukes direkte i drift.
Det er et porteføljeprosjekt som viser hvordan jeg tenker og bygger.
```

The data is simulated:

```text
Demoen bruker simulerte VA-data.
Ingen reelle sensitive VA-infrastrukturdata er brukt.
```

The purpose is decision support:

```text
Beslutningsstøtte, ikke automatisk diagnose.
```

## What To Avoid Saying

Avoid:

- "Systemet finner lekkasjer automatisk."
- "Dette kan erstatte driftskontroll."
- "Dette er AI som bestemmer tiltak."
- "Dette er klart for produksjon."

Say instead:

- "Systemet prioriterer hvor det er mest fornuftig å undersøke først."
- "Fagpersoner må alltid vurdere resultatene."
- "Scoringen er forklarbar og kan justeres."
- "Demoen viser hvordan jeg kobler fagforståelse og software."
