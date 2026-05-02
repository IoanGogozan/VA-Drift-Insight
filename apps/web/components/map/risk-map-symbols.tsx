"use client";

import L from "leaflet";

export function pumpStationIcon(selected: boolean, riskScore: number | null) {
  const color = riskColor(riskScore);
  const size = selected ? 34 : 28;

  return L.divIcon({
    className: "",
    html: `<div style="height:${size}px;width:${size}px;border:3px solid ${color};background:#f8fafc;box-shadow:0 1px 4px rgba(15,23,42,.35);display:grid;place-items:center;transform:rotate(45deg);">
      <div style="height:${Math.round(size * 0.42)}px;width:${Math.round(size * 0.42)}px;border-radius:999px;background:#111827;"></div>
    </div>`,
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

export const incidentIcon = L.divIcon({
  className: "",
  html: '<div style="height:18px;width:18px;border:3px solid #fff;border-radius:999px;background:#b91c1c;box-shadow:0 1px 4px rgba(15,23,42,.35);"></div>',
  iconAnchor: [9, 9],
  popupAnchor: [0, -10]
});

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
