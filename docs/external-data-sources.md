# External Data Sources

This document defines the public data strategy for VA Drift Insight.

The demo should combine open Norwegian public data with simulated VA operational data:

```text
Real Norwegian rainfall data
+ real Norwegian map/geography
+ simulated VA operational data
= credible VA decision-support demo
```

## Final Decision

Use in the main demo:

1. MET Norway Frost API
2. Kartverket grensedata / Geonorge kommunegrenser

Optional future context source:

3. SSB / KOSTRA

## Official Source Links

| API / source | Official URL | Use in VA Drift Insight |
| --- | --- | --- |
| MET Norway Frost API | https://frost.met.no/ | Historical weather data: precipitation, temperature and weather stations |
| Frost API docs | https://frost.met.no/api.html | Endpoint documentation for Frost |
| Kartverket API og data | https://www.kartverket.no/api-og-data | Official Norwegian maps and geodata |
| Kartverket grensedata | https://www.kartverket.no/api-og-data/grensedata | Municipality, county and administrative boundaries |
| Geonorge kommunegrenser dataset | https://kartkatalog.geonorge.no/metadata/administrative-enheter-kommuner/041f1e6e-bdbc-4091-b48f-8a5990f3cc5b | Concrete dataset for municipality boundaries |
| SSB API | https://www.ssb.no/api/pxwebapi | Statbank/KOSTRA API |
| SSB PxWebApi v2 guide | https://www.ssb.no/api/pxwebapiv2 | Technical guide for SSB API v2 |

## Why This Direction

Real VA pipe networks, pump alarms, leakage history and SCADA data are usually sensitive infrastructure data. They should not be used in a public portfolio demo.

The right balance is:

- use real public rainfall data from MET Norway Frost API
- use real public map/geography data from Kartverket / Geonorge
- keep pipe networks, pump stations, incidents, flow, pressure, pump runtime and alarms simulated

This gives the demo operational credibility without exposing sensitive infrastructure data.

## Source 1: MET Norway Frost API

Purpose:

- historical precipitation data
- weather station metadata
- rainfall input for fremmedvann analysis

Official documentation:

- https://frost.met.no/
- https://frost.met.no/api.html

Important implementation notes:

- Frost is a REST API for historical weather and climate observations.
- Access requires a Frost client ID.
- Store `FROST_CLIENT_ID` in environment variables.
- Do not commit Frost credentials.
- Use daily or hourly precipitation depending on availability for the selected station.
- Normalize Frost observations before they enter scoring or charts.

Backend module:

```text
apps/api/src/external-data/met/
  frost-client.ts
  frost.service.ts
```

Responsibilities:

- `frost-client.ts`
  - call Frost API
  - fetch weather stations
  - fetch rainfall observations
  - handle authentication, timeouts and response errors

- `frost.service.ts`
  - choose a relevant station for the demo municipality
  - normalize rainfall observations
  - store rainfall observations
  - expose rainfall data to fremmedvann analysis

Database table:

```sql
CREATE TABLE weather_observations (
  id UUID PRIMARY KEY,
  source TEXT NOT NULL,
  station_id TEXT NOT NULL,
  station_name TEXT,
  municipality_code TEXT,
  observed_at TIMESTAMP NOT NULL,
  rainfall_mm NUMERIC,
  temperature_c NUMERIC,
  quality_code TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

API endpoints:

```text
GET /api/weather/rainfall?municipalityCode=3905&from=2026-04-01&to=2026-04-30
POST /api/import/weather/frost
```

Frontend usage:

- show rainfall source in the fremmedvann screen
- chart real rainfall from Frost against simulated pump runtime/flow/level
- label the data clearly

Norwegian UI text:

```text
Datakilde:
Nedbor: MET Norway Frost API
Pumpedata: Simulert demo-data
```

Interview explanation:

```text
Nedborsdata hentes fra MET Norway Frost API. Pumpestasjonsdata er simulert,
men responsen er modellert slik at den viser typiske monster ved mulig
fremmedvann: okt pumpetid etter nedbor og forsinket respons i avlopssonen.
```

## Source 2: Kartverket / Geonorge

Purpose:

- real municipality boundary
- official Norwegian map/geography context
- optional place names or basemap context

Official documentation:

- https://www.kartverket.no/api-og-data
- https://www.kartverket.no/api-og-data/grensedata
- https://kartkatalog.geonorge.no/metadata/administrative-enheter-kommuner/041f1e6e-bdbc-4091-b48f-8a5990f3cc5b

Important implementation notes:

- Use a real medium-sized municipality for the demo.
- Recommended municipality: Tonsberg kommune.
- Use official municipality boundary data as context.
- Keep all VA operational assets simulated.
- Store source metadata so the UI and reports can explain what is real and what is simulated.

Backend module:

```text
apps/api/src/external-data/kartverket/
  kartverket-client.ts
  municipality-boundary.service.ts
```

Simpler local option:

```text
data/public-geodata/
  municipality-boundary.geojson
```

The local demo can import a prepared GeoJSON file into PostGIS instead of calling a live API during startup.

Database table:

```sql
CREATE TABLE municipalities (
  id UUID PRIMARY KEY,
  municipality_code TEXT NOT NULL,
  name TEXT NOT NULL,
  geometry GEOMETRY(MultiPolygon, 4326),
  source TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

API endpoints:

```text
GET /api/municipality
GET /api/map/context
GET /api/map/assets
```

Frontend usage:

- show real municipality boundary on the map
- overlay simulated VA assets:
  - measuring zones
  - pipe segments
  - pump stations
  - incidents

Layer control:

```text
Kommunegrense
Malesoner
Ledningsnett
Pumpestasjoner
Hendelser
```

Interview explanation:

```text
Kartgrunnlaget og kommunegrensen kommer fra offentlige norske geodata.
Selve VA-nettet er simulert, fordi reelle ledningsdata og pumpestasjonsdata
ofte er sensitive og ikke egner seg for en offentlig demo.
```

## Optional Source: SSB / KOSTRA

Purpose:

- municipality profile context
- water/wastewater statistics
- optional overview card, not core scoring logic

Official documentation:

- https://www.ssb.no/api/pxwebapi
- https://www.ssb.no/api/pxwebapiv2

Important implementation notes:

- SSB/KOSTRA should not be central to leakage or fremmedvann scoring.
- Use it only after MET Frost, Kartverket grensedata, scoring, recommendations and PDF are complete.
- Show SSB/KOSTRA as contextual municipality profile data.

Database table:

```sql
CREATE TABLE municipality_statistics (
  id UUID PRIMARY KEY,
  municipality_code TEXT NOT NULL,
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  unit TEXT,
  source TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

API endpoints:

```text
GET /api/municipality/statistics
POST /api/import/statistics/ssb
```

Frontend usage:

```text
Kommuneprofil
Tonsberg kommune

Datakilde: SSB/KOSTRA
Tema: Kommunal vannforsyning og kommunalt avlop
```

## Target Data Flow

1. Select a real municipality.
2. Import or fetch municipality boundary from Kartverket / Geonorge.
3. Generate simulated measuring zones inside the boundary.
4. Generate simulated pipe network.
5. Generate simulated pump stations.
6. Fetch real rainfall from MET Frost.
7. Simulate pump runtime, flow, level and alarms as response to rainfall.
8. Calculate fremmedvann score.
9. Generate recommendations.
10. Generate PDF report.

## UI Data Sources Card

Add a card in the overview screen:

```text
Datakilder

Apne datakilder:
- MET Norway Frost API: historiske nedborsdata
- Kartverket / Geonorge: kart og kommunegrenser

Simulerte VA-data:
- ledningsnett
- malesoner
- pumpestasjoner
- lekkasjehendelser
- pumpetid, flow, trykk og alarmer

Ingen reelle sensitive VA-infrastrukturdata er brukt.
```

## README Text

```text
This demo combines open Norwegian data sources with simulated VA operational data.

Public data:
- MET Norway Frost API for historical precipitation
- Kartverket / Geonorge for map and municipality boundary data

Simulated data:
- pipe network
- pump stations
- leakage incidents
- flow, pressure, pump runtime and alarms

No real sensitive infrastructure data is used.
```

## Final Portfolio Sentence

```text
Demoen bruker ekte norske nedborsdata og offentlige kartdata,
kombinert med simulerte VA-driftsdata, for a vise beslutningsstotte
for lekkasjekontroll, fremmedvann og prioritering.
```

## Implementation Guardrails

- Public source data must be clearly labeled in the UI and reports.
- Simulated VA data must be clearly labeled in the UI and reports.
- No real pipe network, pump station, alarm, SCADA or leakage-history data should be used.
- External API credentials must stay in environment variables.
- The app must work with seeded fallback data when external APIs are unavailable.
- External integrations must have service-level tests with mocked clients.
