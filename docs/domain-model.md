# Domain Model

## Main Tables

### zones

Represents water meter zones and wastewater catchments.

Fields:

- `id`
- `name`
- `zone_type`: `water_meter_zone | wastewater_catchment`
- `population`
- `baseline_night_flow`
- `current_night_flow`
- `data_quality_score`
- `geometry`
- `created_at`
- `updated_at`

### pipes

Represents water, wastewater and stormwater pipe segments.

Fields:

- `id`
- `pipe_code`
- `zone_id`
- `material`
- `installed_year`
- `diameter_mm`
- `pipe_type`: `water | wastewater | stormwater`
- `criticality`
- `previous_breaks`
- `geometry`
- `created_at`
- `updated_at`

### pump_stations

Represents wastewater pump stations.

Fields:

- `id`
- `station_code`
- `name`
- `catchment_id`
- `capacity_m3h`
- `alarm_count`
- `overflow_events`
- `geometry`
- `created_at`
- `updated_at`

### time_series

Represents operational measurements and rainfall.

Fields:

- `id`
- `asset_type`: `zone | pipe | pump_station`
- `asset_id`
- `timestamp`
- `flow_m3h`
- `pressure_bar`
- `level_m`
- `pump_runtime_minutes`
- `rainfall_mm`
- `created_at`

### incidents

Represents operational events, alarms and field observations.

Fields:

- `id`
- `incident_type`: `leak | pipe_break | high_level_alarm | overflow | complaint | pump_failure | suspected_fremmedvann`
- `asset_type`
- `asset_id`
- `occurred_at`
- `description`
- `resolved_at`
- `geometry`
- `created_at`

### risk_scores

Stores calculated scores and explanations.

Fields:

- `id`
- `asset_type`
- `asset_id`
- `score_type`: `leakage | fremmedvann | data_quality | sanering`
- `score`
- `confidence`
- `explanation`
- `calculated_at`

### recommendations

Stores recommended operational actions.

Fields:

- `id`
- `type`: `leakage | fremmedvann | sanering | data_gap`
- `priority`: `high | medium | low`
- `asset_type`
- `asset_id`
- `area_name`
- `reason`
- `suggested_action`
- `status`: `new | planned | in_progress | completed | dismissed`
- `created_at`
- `updated_at`

## Norwegian UI Labels

Incident labels:

- `leak`: Vannlekkasje
- `pipe_break`: Ledningsbrudd
- `high_level_alarm`: Høy-nivå alarm
- `overflow`: Overløp
- `complaint`: Kundemelding
- `pump_failure`: Pumpefeil
- `suspected_fremmedvann`: Mistanke om fremmedvann

Recommendation status labels:

- `new`: Ny
- `planned`: Planlagt
- `in_progress`: Pågår
- `completed`: Fullført
- `dismissed`: Avvist
