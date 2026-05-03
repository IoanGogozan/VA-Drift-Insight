# Scoring Methodology

## Principle

Use explainable scoring in the demo.

The demo uses transparent rule-based scoring instead of ML. This is more credible for a portfolio demo because VA data quality can vary and operational users need to understand why an area is prioritized.

## Leakage Risk Score

Formula:

```text
leakage_risk_score =
  25% pipe_age_score +
  20% material_score +
  20% historical_breaks_score +
  20% night_flow_anomaly_score +
  10% pressure_variation_score +
  5% criticality_score
```

### Pipe Age Score

| Age | Score |
| --- | ---: |
| 0-10 years | 10 |
| 10-25 years | 30 |
| 25-40 years | 55 |
| 40-60 years | 80 |
| 60+ years | 95 |
| Unknown | 60 with lower confidence |

### Material Score

| Material | Score |
| --- | ---: |
| PE / newer PVC | 20-35 |
| Older PVC | 45 |
| Duktilt støpejern | 45-60 |
| Støpejern | 75 |
| Betong | 65 |
| Eternitt/asbestsement | 80 |
| Unknown | 55 with lower confidence |

### Example Leakage Explanation

Risikoen er høy fordi ledningene i området er eldre enn 45 år, det finnes tidligere lekkasjer i nærheten, og nattforbruket har økt med 17 % sammenlignet med normalnivå.

## Fremmedvann Score

Formula:

```text
fremmedvann_score =
  35% rainfall_correlation +
  25% pump_runtime_increase +
  20% delayed_flow_response +
  10% overflow_events +
  10% high_level_alarms
```

### Indicators

Rainfall correlation:

- Compare rainfall and pump runtime with delay windows
- Use 0-3h, 3-6h, 6-12h and 12-24h windows

Pump runtime increase:

- Compare wet weather runtime against dry weather baseline

Delayed flow response:

- Score high when flow remains elevated after rainfall stops

Operational incidents:

- Overflow events increase score
- High-level alarms increase score

### Example Fremmedvann Explanation

Pumpetiden øker tydelig 4-6 timer etter nedbør og holder seg forhøyet etter at regnet stopper. Dette kan tyde på innlekking eller feilkoblet overvann oppstrøms pumpestasjonen.

## Data Quality Score

Formula:

```text
data_quality_score =
  25% pipe_age_completeness +
  20% material_completeness +
  20% sensor_data_availability +
  15% geolocation_quality +
  10% incident_history_quality +
  10% recent_data_coverage
```

### Example Data Quality Explanation

Datakvaliteten er redusert fordi 42 % av ledningene mangler installasjonsår, og målesonen har ikke gyldige flowdata siste 30 dager.

## Confidence

Every score should have a confidence value.

Confidence should be reduced when:

- Important fields are missing
- Sensor data is old
- Geometry is missing or low quality
- Incident history is incomplete
- There are too few observations

This makes the demo more realistic because VA data is rarely perfect.
