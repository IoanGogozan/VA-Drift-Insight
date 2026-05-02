"use client";

import type { MapAssetFeature } from "@/lib/api";

type RiskMapProps = {
  features: MapAssetFeature[];
  selectedId?: string | null;
  onSelectAsset: (feature: MapAssetFeature) => void;
};

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

const width = 720;
const height = 430;
const padding = 34;

export function RiskMap({ features, selectedId, onSelectAsset }: RiskMapProps) {
  const bounds = getBounds(features);
  const zones = features.filter((feature) => feature.properties.assetType === "zone");
  const pipes = features.filter((feature) => feature.properties.assetType === "pipe");
  const pumpStations = features.filter((feature) => feature.properties.assetType === "pump_station");

  return (
    <div className="border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-ink">VA-kart</h2>
        <div className="flex flex-wrap gap-3 text-xs text-muted">
          <LegendSwatch className="bg-riskHigh" label="Høy risiko" />
          <LegendSwatch className="bg-riskMedium" label="Medium" />
          <LegendSwatch className="bg-riskLow" label="Lav" />
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Kart med VA-objekter" className="block w-full">
        <rect width={width} height={height} fill="#f7f8f5" />
        {zones.map((feature) => (
          <path
            key={feature.id}
            d={polygonPath(feature, bounds)}
            fill={riskFill(feature.properties.riskScore)}
            stroke={feature.id === selectedId ? "#1f2a2e" : "#ffffff"}
            strokeWidth={feature.id === selectedId ? 4 : 2}
            opacity={0.78}
            className="cursor-pointer transition-opacity hover:opacity-100"
            onClick={() => onSelectAsset(feature)}
          />
        ))}
        {pipes.map((feature) => (
          <path
            key={feature.id}
            d={linePath(feature, bounds)}
            fill="none"
            stroke={riskStroke(feature.properties.riskScore)}
            strokeWidth={feature.id === selectedId ? 7 : 5}
            strokeLinecap="round"
            className="cursor-pointer"
            onClick={() => onSelectAsset(feature)}
          />
        ))}
        {pumpStations.map((feature) => {
          const [cx, cy] = projectPoint(pointCoordinates(feature), bounds);

          return (
            <g key={feature.id} className="cursor-pointer" onClick={() => onSelectAsset(feature)}>
              <circle
                cx={cx}
                cy={cy}
                r={feature.id === selectedId ? 12 : 9}
                fill="#1f2a2e"
                stroke={riskStroke(feature.properties.riskScore)}
                strokeWidth="4"
              />
              <text x={cx + 13} y={cy + 4} className="fill-ink text-[12px] font-semibold">
                {feature.properties.name.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LegendSwatch({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 ${className}`} />
      {label}
    </span>
  );
}

function polygonPath(feature: MapAssetFeature, bounds: Bounds) {
  if (feature.geometry.type !== "Polygon") {
    return "";
  }

  return feature.geometry.coordinates
    .map((ring) =>
      ring
        .map((point, index) => {
          const [x, y] = projectPoint(point, bounds);
          return `${index === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ")
    )
    .join(" Z ");
}

function linePath(feature: MapAssetFeature, bounds: Bounds) {
  if (feature.geometry.type !== "LineString") {
    return "";
  }

  return feature.geometry.coordinates
    .map((point, index) => {
      const [x, y] = projectPoint(point, bounds);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function pointCoordinates(feature: MapAssetFeature): [number, number] {
  return feature.geometry.type === "Point" ? feature.geometry.coordinates : [0, 0];
}

function projectPoint([longitude, latitude]: [number, number], bounds: Bounds): [number, number] {
  const x = padding + ((longitude - bounds.minX) / (bounds.maxX - bounds.minX)) * (width - padding * 2);
  const y = height - padding - ((latitude - bounds.minY) / (bounds.maxY - bounds.minY)) * (height - padding * 2);

  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
}

function getBounds(features: MapAssetFeature[]): Bounds {
  const points = features.flatMap(extractPoints);
  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);

  return {
    minX: Math.min(...longitudes),
    maxX: Math.max(...longitudes),
    minY: Math.min(...latitudes),
    maxY: Math.max(...latitudes)
  };
}

function extractPoints(feature: MapAssetFeature): [number, number][] {
  if (feature.geometry.type === "Point") {
    return [feature.geometry.coordinates];
  }

  if (feature.geometry.type === "LineString") {
    return feature.geometry.coordinates;
  }

  return feature.geometry.coordinates.flat();
}

function riskFill(score: number | null) {
  if (score === null) {
    return "#cbd5e1";
  }

  if (score >= 75) {
    return "#d94f45";
  }

  if (score >= 50) {
    return "#d89b2b";
  }

  return "#4f9b62";
}

function riskStroke(score: number | null) {
  return riskFill(score);
}
