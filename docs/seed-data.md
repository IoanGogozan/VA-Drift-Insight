# Seed Data Plan

## Fictional Municipality

Fjordvik kommune

## Water Meter Zones

- Målesone Nord
- Målesone Sentrum
- Målesone Sør

## Wastewater Catchments

- Avløpssone A
- Avløpssone B
- Avløpssone C

## Pump Stations

- PS-01 Sentrum
- PS-02 Havna
- PS-03 Skoglia
- PS-04 Industriveien
- PS-05 Nordbekken

## Pipe Materials

- PVC
- PE
- støpejern
- duktilt støpejern
- betong
- eternitt/asbestsement

## Incident Types

Internal values:

- `leak`
- `pipe_break`
- `high_level_alarm`
- `overflow`
- `complaint`
- `pump_failure`
- `suspected_fremmedvann`

Norwegian UI labels:

- Vannlekkasje
- Ledningsbrudd
- Høy-nivå alarm
- Overløp
- Kundemelding
- Pumpefeil
- Mistanke om fremmedvann

## MVP Data Files

Recommended files:

```text
data/
  seed/
    zones.geojson
    pipes.geojson
    pump_stations.geojson
    time_series.csv
    incidents.csv
```

## Data Behavior To Demonstrate

Målesone Nord:

- High leakage score
- Increased night flow
- Older cast iron pipes
- Previous leaks nearby

Målesone Sentrum:

- Medium leakage score
- Mixed pipe materials
- Some data gaps

Målesone Sør:

- Lower leakage score
- Newer PE/PVC pipes
- Better data quality

PS-03 Skoglia:

- High fremmedvann suspicion
- Pump runtime increases 4-6 hours after rainfall
- Flow remains elevated after rainfall stops
- High-level alarms during wet weather

PS-01 Sentrum:

- Medium fremmedvann suspicion
- Some rainfall response

PS-02 Havna:

- Lower suspicion
- Stable dry and wet weather behavior
