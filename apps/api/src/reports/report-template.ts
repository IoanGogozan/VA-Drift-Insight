type ReportData = {
  generatedAt: Date;
  overview: {
    kpis: {
      highRiskLeakageZones: number;
      fremmedvannSuspicions: number;
      activeAnomalies: number;
      recommendedFieldChecks: number;
      dataCompletenessScore: number;
    };
  };
  leakageScores: Array<{
    assetId: string;
    score: number;
    confidence: number;
    explanation: string;
  }>;
  fremmedvannScores: Array<{
    assetId: string;
    score: number;
    confidence: number;
    explanation: string;
  }>;
  recommendations: Array<{
    priority: string;
    type: string;
    areaName: string;
    reason: string;
    suggestedAction: string;
    status: string;
  }>;
  waterZones: Array<{
    name: string;
    nightFlowM3h: number;
    baselineNightFlowM3h: number;
    estimatedLossM3Day: number;
    trend30d: number;
    status: string;
    dataQualityScore: number | null;
  }>;
  privateCases: Array<{
    address: string;
    zoneName: string;
    estimatedLossM3Day: number;
    status: string;
    nextFollowUp: Date | null;
  }>;
  fieldTasks: Array<{
    priority: string;
    areaName: string;
    type: string;
    reason: string;
    suggestedMethod: string;
    status: string;
  }>;
  dataGaps: Array<{
    area: string;
    finding: string;
    recommendation: string;
  }>;
  dataSources: Array<{
    name: string;
    url: string;
    description: string;
    isMvp: boolean;
  }>;
};

export function buildVaRiskReportHtml(data: ReportData) {
  const topRecommendations = data.recommendations.slice(0, 10);

  return `<!doctype html>
<html lang="no">
<head>
  <meta charset="utf-8" />
  <title>VA-risikorapport</title>
  <style>
    body { color: #1f2a2e; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.55; margin: 0; }
    h1, h2, h3 { color: #172126; margin: 0 0 10px; }
    h1 { font-size: 30px; }
    h2 { border-bottom: 1px solid #d7dee2; font-size: 19px; padding-bottom: 6px; }
    h3 { font-size: 14px; margin-top: 14px; }
    p { margin: 0 0 8px; }
    table { border-collapse: collapse; margin-top: 10px; width: 100%; }
    th { background: #eef2f4; color: #42515a; font-size: 10px; text-align: left; text-transform: uppercase; }
    th, td { border-bottom: 1px solid #e1e7ea; padding: 7px; vertical-align: top; }
    .page { min-height: 260mm; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .subtitle { color: #566873; font-size: 15px; margin-bottom: 18px; }
    .meta { color: #566873; margin-bottom: 28px; }
    .grid { display: grid; gap: 10px; grid-template-columns: repeat(4, 1fr); margin: 18px 0; }
    .kpi { border: 1px solid #d7dee2; padding: 10px; }
    .kpi strong { display: block; font-size: 24px; margin-top: 6px; }
    .note { background: #f7f8f5; border-left: 4px solid #1f2a2e; padding: 10px; }
    .source { color: #566873; font-size: 11px; }
    .muted { color: #566873; }
    .small { font-size: 11px; }
    .status { font-weight: bold; text-transform: uppercase; }
  </style>
</head>
<body>
  <section class="page">
    <h1>VA-risikorapport</h1>
    <p class="subtitle">Fjordvik kommune - Demo dataset</p>
    <p class="meta">Generert: ${formatDate(data.generatedAt)}</p>
    <h2>Sammendrag</h2>
    <p>Analysen viser ${data.overview.kpis.highRiskLeakageZones} områder med høy lekkasjerisiko, ${data.overview.kpis.fremmedvannSuspicions} pumpestasjoner med tydelig regnrelatert respons og ${data.overview.kpis.recommendedFieldChecks} anbefalte feltkontroller.</p>
    <p>Rapporten er laget som beslutningsstøtte for lekkasjekontroll, fremmedvannstiltak og prioritering av videre undersøkelser.</p>
    <p class="note">Beslutningsstøtte, ikke automatisk diagnose.</p>
    <div class="grid">
      <div class="kpi">Høyrisiko lekkasjesoner<strong>${data.overview.kpis.highRiskLeakageZones}</strong></div>
      <div class="kpi">Mistanke om fremmedvann<strong>${data.overview.kpis.fremmedvannSuspicions}</strong></div>
      <div class="kpi">Anbefalte feltkontroller<strong>${data.overview.kpis.recommendedFieldChecks}</strong></div>
      <div class="kpi">Datakvalitet<strong>${data.overview.kpis.dataCompletenessScore}%</strong></div>
    </div>
    <h3>Datagrunnlag</h3>
    <p>Rapporten kombinerer åpne norske datakilder med simulerte VA-driftsdata. Ingen reelle sensitive VA-infrastrukturdata er brukt.</p>
  </section>

  <section class="page">
    <h2>Vannsoner og estimert vanntap</h2>
    <p>Tabellen viser nattforbruk mot baseline og estimert mulig vanntap. Dette er grunnlaget for prioritering av lekkasjekontroll i demoen.</p>
    ${waterZonesTable(data.waterZones)}
    <h3>Prioritert lekkasjekontroll</h3>
    ${scoreTable(data.leakageScores.slice(0, 6), "Lekkasje")}
  </section>

  <section class="page">
    <h2>Anbefalte feltkontroller</h2>
    <p>Feltoppgavene viser hvordan scoring og datagrunnlag oversettes til praktisk arbeid: logger, lytting, ventilkontroll, måleroppfølging eller kuminspeksjon.</p>
    ${fieldTasksTable(data.fieldTasks)}
    <h3>Topp anbefalte tiltak</h3>
    ${recommendationsTable(topRecommendations)}
  </section>

  <section class="page">
    <h2>Private stikkledninger</h2>
    <p>Private lekkasjesaker vises separat fordi oppfølging ofte handler om kontakt, dokumentasjon og neste steg, ikke bare teknisk lekkasjesøk.</p>
    ${privateCasesTable(data.privateCases)}
  </section>

  <section class="page">
    <h2>Fremmedvannindikasjoner</h2>
    ${scoreTable(data.fremmedvannScores, "Fremmedvann")}
  </section>

  <section class="page">
    <h2>Datakvalitet og datagap</h2>
    <p>Datakvalitet er behandlet som en del av beslutningsgrunnlaget. Manglende alder, materiale, geometri eller sensorhistorikk skal redusere tillit og kan gi egne anbefalinger om datagap.</p>
    <p>Gjennomsnittlig datakvalitet i demo-datasettet er ${data.overview.kpis.dataCompletenessScore}%.</p>
    ${dataGapsTable(data.dataGaps)}
    <h2>Metode og scoring</h2>
    <p>Lekkasjeprioritet vekter nattforbruksøkning, estimert vanntap, tidligere lekkasjer, ledningsalder/materiale, åpne private saker og datakvalitet.</p>
    <p>Fremmedvann score vekter regnkorrelasjon, økt pumpetid, forsinket respons, overløp og høy-nivå alarmer.</p>
    <p>Rapporten bruker simulerte VA-data inspirert av realistiske driftssituasjoner. Kartgrunnlag og nedbør kan komme fra åpne norske datakilder.</p>
    <p>Alle score skal leses som prioriteringsstøtte, ikke som automatisk diagnose.</p>
  </section>

  <section class="page">
    <h2>Datakilder</h2>
    ${dataSourcesTable(data.dataSources)}
    <h2>Vedlegg: scoringtabell</h2>
    ${scoreTable([...data.leakageScores, ...data.fremmedvannScores], "Alle score")}
  </section>
</body>
</html>`;
}

function waterZonesTable(waterZones: ReportData["waterZones"]) {
  return `<table>
    <thead><tr><th>Sone</th><th>Nattforbruk</th><th>Baseline</th><th>Estimert vanntap</th><th>Trend 30d</th><th>Status</th><th>Datakvalitet</th></tr></thead>
    <tbody>${waterZones
      .map(
        (zone) =>
          `<tr><td>${escapeHtml(zone.name)}</td><td>${formatNumber(zone.nightFlowM3h)} m³/h</td><td>${formatNumber(zone.baselineNightFlowM3h)} m³/h</td><td>${formatNumber(zone.estimatedLossM3Day)} m³/d</td><td>${formatTrend(zone.trend30d)}</td><td><span class="status">${formatStatus(zone.status)}</span></td><td>${zone.dataQualityScore ?? "-"}%</td></tr>`
      )
      .join("")}</tbody>
  </table>`;
}

function fieldTasksTable(tasks: ReportData["fieldTasks"]) {
  return `<table>
    <thead><tr><th>Prioritet</th><th>Område</th><th>Type</th><th>Årsak</th><th>Metode</th><th>Status</th></tr></thead>
    <tbody>${tasks
      .map(
        (task) =>
          `<tr><td>${formatStatus(task.priority)}</td><td>${escapeHtml(task.areaName)}</td><td>${formatStatus(task.type)}</td><td>${escapeHtml(task.reason)}</td><td>${formatStatus(task.suggestedMethod)}</td><td>${formatStatus(task.status)}</td></tr>`
      )
      .join("")}</tbody>
  </table>`;
}

function privateCasesTable(cases: ReportData["privateCases"]) {
  return `<table>
    <thead><tr><th>Adresse</th><th>Sone</th><th>Estimert tap</th><th>Status</th><th>Neste oppfølging</th></tr></thead>
    <tbody>${cases
      .map(
        (item) =>
          `<tr><td>${escapeHtml(item.address)}</td><td>${escapeHtml(item.zoneName)}</td><td>${formatNumber(item.estimatedLossM3Day)} m³/d</td><td>${formatStatus(item.status)}</td><td>${item.nextFollowUp ? formatDateOnly(item.nextFollowUp) : "-"}</td></tr>`
      )
      .join("")}</tbody>
  </table>`;
}

function dataGapsTable(gaps: ReportData["dataGaps"]) {
  return `<table>
    <thead><tr><th>Område</th><th>Funn</th><th>Anbefaling</th></tr></thead>
    <tbody>${gaps
      .map(
        (gap) =>
          `<tr><td>${escapeHtml(gap.area)}</td><td>${escapeHtml(gap.finding)}</td><td>${escapeHtml(gap.recommendation)}</td></tr>`
      )
      .join("")}</tbody>
  </table>`;
}

function recommendationsTable(recommendations: ReportData["recommendations"]) {
  return `<table>
    <thead><tr><th>Prioritet</th><th>Type</th><th>Område</th><th>Årsak</th><th>Anbefalt tiltak</th><th>Status</th></tr></thead>
    <tbody>${recommendations
      .map(
        (item) =>
          `<tr><td>${escapeHtml(item.priority)}</td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(item.areaName)}</td><td>${escapeHtml(item.reason)}</td><td>${escapeHtml(item.suggestedAction)}</td><td>${escapeHtml(item.status)}</td></tr>`
      )
      .join("")}</tbody>
  </table>`;
}

function scoreTable(scores: ReportData["leakageScores"], label: string) {
  return `<table>
    <thead><tr><th>Type</th><th>Asset</th><th>Score</th><th>Tillit</th><th>Forklaring</th></tr></thead>
    <tbody>${scores
      .map(
        (score) =>
          `<tr><td>${label}</td><td>${escapeHtml(score.assetId)}</td><td>${score.score}</td><td>${score.confidence}%</td><td>${escapeHtml(score.explanation)}</td></tr>`
      )
      .join("")}</tbody>
  </table>`;
}

function dataSourcesTable(sources: ReportData["dataSources"]) {
  return `<table>
    <thead><tr><th>Datakilde</th><th>Bruk</th><th>MVP</th></tr></thead>
    <tbody>${sources
      .map(
        (source) =>
          `<tr><td>${escapeHtml(source.name)}<br><span class="source">${escapeHtml(source.url)}</span></td><td>${escapeHtml(source.description)}</td><td>${source.isMvp ? "Ja" : "Nei"}</td></tr>`
      )
      .join("")}</tbody>
  </table>`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 }).format(value);
}

function formatTrend(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatNumber(value)}%`;
}

function formatStatus(value: string) {
  const labels: Record<string, string> = {
    high: "Høy",
    medium: "Medium",
    low: "Lav",
    normal: "Normal",
    suspect: "Mistenkt",
    suspected: "Mistenkt",
    contacted: "Kontaktet",
    repaired: "Reparert",
    closed: "Lukket",
    new: "Ny",
    planned: "Planlagt",
    in_progress: "Pågår",
    completed: "Utført",
    leakage_control: "Lekkasjekontroll",
    fremmedvann_control: "Fremmedvann",
    meter_follow_up: "Måleroppfølging",
    valve_check: "Ventilkontroll",
    data_quality: "Datakvalitet",
    listening: "Lytting",
    logger: "Logger",
    manhole_inspection: "Kuminspeksjon",
    cctv: "CCTV",
    smoke_test: "Røyktest"
  };

  return labels[value] ?? value;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Oslo"
  }).format(date);
}

function formatDateOnly(date: Date) {
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
    timeZone: "Europe/Oslo"
  }).format(date);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
