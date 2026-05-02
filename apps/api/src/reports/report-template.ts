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
    <h2>Topp 10 risikoområder og anbefalte tiltak</h2>
    ${recommendationsTable(topRecommendations)}
  </section>

  <section class="page">
    <h2>Lekkasjeindikasjoner</h2>
    ${scoreTable(data.leakageScores, "Lekkasje")}
  </section>

  <section class="page">
    <h2>Fremmedvannindikasjoner</h2>
    ${scoreTable(data.fremmedvannScores, "Fremmedvann")}
  </section>

  <section class="page">
    <h2>Datakvalitet og datagap</h2>
    <p>Datakvalitet er behandlet som en del av beslutningsgrunnlaget. Manglende alder, materiale, geometri eller sensorhistorikk skal redusere tillit og kan gi egne anbefalinger om datagap.</p>
    <p>Gjennomsnittlig datakvalitet i demo-datasettet er ${data.overview.kpis.dataCompletenessScore}%.</p>
    <h2>Metode og scoring</h2>
    <p>Lekkasje score vekter alder, materiale, tidligere brudd, nattforbruksavvik, trykkvariasjon og kritikalitet.</p>
    <p>Fremmedvann score vekter regnkorrelasjon, økt pumpetid, forsinket respons, overløp og høy-nivå alarmer.</p>
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
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
