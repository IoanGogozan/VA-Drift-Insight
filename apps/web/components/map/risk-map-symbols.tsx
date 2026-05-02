"use client";

import L from "leaflet";

export function pumpStationIcon(selected: boolean, riskScore: number | null) {
  const color = riskColor(riskScore);
  const size = selected ? 30 : 24;
  const fontSize = selected ? 10 : 9;

  return L.divIcon({
    className: "",
    html: `<div title="Pumpestasjon" style="height:${size}px;width:${size}px;border:2px solid ${color};background:#f8fafc;box-shadow:0 1px 3px rgba(15,23,42,.28);display:grid;place-items:center;transform:rotate(45deg);">
      <div style="transform:rotate(-45deg);font:700 ${fontSize}px Arial,sans-serif;color:#111827;letter-spacing:0;">PS</div>
    </div>`,
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

export function incidentIcon(subtype: string) {
  const codeBySubtype: Record<string, string> = {
    leak: "LK",
    high_level_alarm: "AL",
    overflow: "OF"
  };
  const colorBySubtype: Record<string, string> = {
    leak: "#b91c1c",
    high_level_alarm: "#b45309",
    overflow: "#7c2d12"
  };
  const code = codeBySubtype[subtype] ?? "AV";
  const color = colorBySubtype[subtype] ?? "#b91c1c";

  return L.divIcon({
    className: "",
    html: `<div title="Driftshendelse" style="height:22px;width:22px;border:2px solid #fff;border-radius:999px;background:${color};box-shadow:0 1px 3px rgba(15,23,42,.28);display:grid;place-items:center;font:700 8px Arial,sans-serif;color:#fff;letter-spacing:0;">${code}</div>`,
    iconAnchor: [11, 11],
    popupAnchor: [0, -11]
  });
}

export function LegendLine({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-0.5 w-5 ${className}`} />
      {label}
    </span>
  );
}

export function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}

export function riskColor(score: number | null) {
  if (score === null) {
    return "#64748b";
  }

  if (score >= 75) {
    return "#b91c1c";
  }

  if (score >= 50) {
    return "#b7791f";
  }

  return "#047857";
}
