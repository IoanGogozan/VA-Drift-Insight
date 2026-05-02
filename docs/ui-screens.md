# UI Screens

## Screen 1: VA-risikooversikt

Purpose:

Show an operational overview that turns technical data into priorities.

Content:

- Map
- KPI cards
- Top 5 recommendations
- Data quality card

KPI labels:

- Høyrisiko lekkasjesoner
- Mistanke om fremmedvann
- Aktive avvik
- Anbefalte feltkontroller
- Datakvalitet
- Saneringsprioritet

Example values:

- 3 høyrisiko lekkasjesoner
- 2 pumpestasjoner med regnrelatert innlekking
- 14 ledningsstrekk med høy saneringsprioritet
- Datakvalitet: 72 %
- 8 anbefalte feltkontroller

What it demonstrates:

Pot transforma date tehnice în overview operațional.

## Screen 2: Hvor bør vi lete først?

Purpose:

Show explainable leakage prioritization.

Selected item example:

Målesone Nord - Risiko: 82/100

Explanation:

- Økt nattforbruk siste 14 dager
- Ledninger eldre enn 45 år
- 2 tidligere lekkasjer innen 300 meter
- Variasjon i trykk observert
- Ingen tydelig regnkorrelasjon

Recommended action:

Akustisk lekkasjesøk i gate X/Y og ventilkontroll ved node V-14.

Required phrase:

Beslutningsstøtte, ikke automatisk diagnose.

## Screen 3: Regn vs pumpestasjon

Subtitle:

Analyse av regnrespons, pumpetid, vannstand og alarmer

Selected station example:

Pumpestasjon PS-03 - Mistanke om fremmedvann: Høy

Explanation:

- Pumpetid øker 4-6 timer etter nedbør
- Flow holder seg forhøyet 18 timer etter at regnet stopper
- Gjentatte høy-nivå alarmer ved våtvær
- Ingen tilsvarende økning i tørrvær

Recommended action:

Inspiser oppstrøms kummer, gjennomfør CCTV/røyktest i delområde B, og vurder midlertidig flowmåler i 14 dager.

## Screen 4: Anbefalte tiltak

Purpose:

Show that the product supports workflow, not only dashboards.

Columns:

- Prioritet
- Type
- Område
- Årsak
- Anbefalt tiltak
- Status

Example rows:

| Prioritet | Type | Område | Årsak | Anbefalt tiltak | Status |
| --- | --- | --- | --- | --- | --- |
| Høy | Lekkasje | Målesone Nord | Økt nattforbruk | Akustisk lekkasjesøk | Ny |
| Høy | Fremmedvann | PS-03 | Regnkorrelasjon | CCTV/røyktest | Ny |
| Medium | Sanering | Ledning 141 | Alder + avvik | Legg inn i saneringsplan | Planlagt |
| Medium | Datagap | Sone C | Mangler målerdata | Midlertidig måler | Ny |
