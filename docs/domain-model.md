# Domain Model

The database model is designed around VA operational decision support:

```text
Assets -> Measurements -> Scores -> Recommendations -> Field follow-up -> Report
```

## Core Asset Tables

### zones

Represents water meter zones and wastewater catchments.

Important fields:

- `zone_type`
- `population`
- `baseline_night_flow`
- `current_night_flow`
- `data_quality_score`
- `geometry`

### water_zones

Represents leakage-control zones with water loss metrics.

Important fields:

- `total_consumption_m3_day`
- `night_flow_m3h`
- `baseline_night_flow_m3h`
- `estimated_loss_m3_day`
- `trend_7d`
- `trend_30d`
- `status`: `normal | suspect | high`
- `geometry`

### pipes

Represents water, wastewater and stormwater pipe segments.

Important fields:

- `pipe_code`
- `zone_id`
- `material`
- `installed_year`
- `diameter_mm`
- `pipe_type`: `water | wastewater | stormwater`
- `criticality`
- `previous_breaks`
- `geometry`

### pump_stations

Represents wastewater pump stations.

Important fields:

- `station_code`
- `catchment_id`
- `capacity_m3h`
- `alarm_count`
- `overflow_events`
- `geometry`

### network_nodes

Represents map objects such as valves, manholes, meters and sensors.

Important fields:

- `node_code`
- `node_type`
- `pipe_type`
- `status`
- `geometry`

## Operational Data

### time_series

Represents operational measurements and rainfall.

Important fields:

- `asset_type`
- `asset_id`
- `timestamp`
- `flow_m3h`
- `pressure_bar`
- `level_m`
- `pump_runtime_minutes`
- `rainfall_mm`

### incidents

Represents operational events, alarms and field observations.

Incident types:

- `leak`
- `pipe_break`
- `high_level_alarm`
- `overflow`
- `complaint`
- `pump_failure`
- `suspected_fremmedvann`

## Analysis And Workflow

### risk_scores

Stores calculated scores and explanations.

Score types:

- `leakage`
- `fremmedvann`
- `data_quality`
- `sanering`

### recommendations

Stores recommended operational actions.

Important fields:

- `type`: `leakage | fremmedvann | sanering | data_gap`
- `priority`: `high | medium | low`
- `area_name`
- `reason`
- `suggested_action`
- `status`

### field_tasks

Stores practical field work derived from analysis.

Task types:

- `leakage_control`
- `fremmedvann_control`
- `meter_follow_up`
- `valve_check`
- `data_quality`

Methods:

- `listening`
- `logger`
- `valve_check`
- `meter_follow_up`
- `manhole_inspection`
- `cctv`
- `smoke_test`

### private_service_cases

Stores follow-up of suspected private service line leaks.

Statuses:

- `suspected`
- `contacted`
- `repaired`
- `closed`

## Public Data And Import Tracking

### municipalities

Stores municipality metadata and boundary geometry.

### weather_observations

Stores weather observations from public sources or fallback seed data.

### external_data_sources

Documents public data sources used in the demo.

### import_runs

Stores import and validation summaries.

### import_validation_errors

Stores validation findings from imports.

## Norwegian UI Labels

Incident labels:

- `leak`: Vannlekkasje
- `pipe_break`: Ledningsbrudd
- `high_level_alarm`: Høy-nivå alarm
- `overflow`: Overløp
- `complaint`: Kundemelding
- `pump_failure`: Pumpefeil
- `suspected_fremmedvann`: Mistanke om fremmedvann

Status labels:

- `new`: Ny
- `planned`: Planlagt
- `in_progress`: Pågår
- `completed`: Utført
- `dismissed`: Avvist
