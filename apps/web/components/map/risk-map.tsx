"use client";

import type { MapAssetFeature, MapContextFeature } from "@/lib/api";

type RiskMapProps = {
  features: MapAssetFeature[];
  contextFeatures: MapContextFeature[];
  selectedId?: string | null;
  onSelectAsset: (feature: MapAssetFeature) => void;
};

type Bounds = {
  minWorldX: number;
  maxWorldX: number;
  minWorldY: number;
  maxWorldY: number;
};

const width = 720;
const height = 430;
const padding = 34;
const tileSize = 256;
const tileZoom = 12;

export function RiskMap({ features, contextFeatures, selectedId, onSelectAsset }: RiskMapProps) {
  const bounds = getBounds([...features, ...contextFeatures]);
  const zones = features.filter((feature) => feature.properties.assetType === "zone");
  const pipes = features.filter((feature) => feature.properties.assetType === "pipe");
  const pumpStations = features.filter((feature) => feature.properties.assetType === "pump_station");

  return (
    <div className="border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-ink">VA-kart</h2>
        <div className="flex flex-wrap gap-3 text-xs text-muted">
          <LegendSwatch className="border border-slate-400 bg-transparent" label="Kommunegrense" />
          <LegendSwatch className="bg-riskHigh" label="Høy risiko" />
          <LegendSwatch className="bg-riskMedium" label="Medium" />
          <LegendSwatch className="bg-riskLow" label="Lav" />
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Kart med VA-objekter" className="block w-full">
        <rect width={width} height={height} fill="#edf2f5" />
        <BasemapTiles bounds={bounds} />
        {contextFeatures.map((feature) => (
          <path
            key={feature.id}
            d={multiPolygonPath(feature, bounds)}
            fill="#dce6ec"
            stroke="#5f6f7a"
            strokeDasharray="8 7"
            strokeWidth="2"
            opacity="0.36"
          />
        ))}
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
      <div className="border-t border-slate-200 px-4 py-2 text-xs text-muted">
        Bakgrunnskart: Kartverket topo WMTS. VA-data er simulert demo-data.
      </div>
    </div>
  );
}

function BasemapTiles({ bounds }: { bounds: Bounds }) {
  const minTileX = Math.floor(bounds.minWorldX / tileSize);
  const maxTileX = Math.floor(bounds.maxWorldX / tileSize);
  const minTileY = Math.floor(bounds.minWorldY / tileSize);
  const maxTileY = Math.floor(bounds.maxWorldY / tileSize);
  const tiles = [];

  for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
    for (let tileY = minTileY; tileY <= maxTileY; tileY += 1) {
      const x = worldToSvgX(tileX * tileSize, bounds);
      const y = worldToSvgY(tileY * tileSize, bounds);
      const nextX = worldToSvgX((tileX + 1) * tileSize, bounds);
      const nextY = worldToSvgY((tileY + 1) * tileSize, bounds);

      tiles.push(
        <image
          key={`${tileX}-${tileY}`}
          href={`https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/${tileZoom}/${tileY}/${tileX}.png`}
          x={x}
          y={y}
          width={nextX - x}
          height={nextY - y}
          preserveAspectRatio="none"
          opacity="0.9"
        />
      );
    }
  }

  return <>{tiles}</>;
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

function multiPolygonPath(feature: MapContextFeature, bounds: Bounds) {
  return feature.geometry.coordinates
    .flat()
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
  const [worldX, worldY] = lonLatToWorldPixels(longitude, latitude, tileZoom);
  const x = worldToSvgX(worldX, bounds);
  const y = worldToSvgY(worldY, bounds);

  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
}

function getBounds(features: Array<MapAssetFeature | MapContextFeature>): Bounds {
  const points = features.flatMap(extractPoints);

  if (points.length === 0) {
    return { minWorldX: 0, maxWorldX: 1, minWorldY: 0, maxWorldY: 1 };
  }

  const worldPoints = points.map(([longitude, latitude]) => lonLatToWorldPixels(longitude, latitude, tileZoom));
  const worldXs = worldPoints.map(([worldX]) => worldX);
  const worldYs = worldPoints.map(([, worldY]) => worldY);
  const minWorldX = Math.min(...worldXs);
  const maxWorldX = Math.max(...worldXs);
  const minWorldY = Math.min(...worldYs);
  const maxWorldY = Math.max(...worldYs);
  const padX = Math.max((maxWorldX - minWorldX) * 0.08, 80);
  const padY = Math.max((maxWorldY - minWorldY) * 0.08, 80);

  return {
    minWorldX: minWorldX - padX,
    maxWorldX: maxWorldX + padX,
    minWorldY: minWorldY - padY,
    maxWorldY: maxWorldY + padY
  };
}

function worldToSvgX(worldX: number, bounds: Bounds) {
  return padding + ((worldX - bounds.minWorldX) / (bounds.maxWorldX - bounds.minWorldX)) * (width - padding * 2);
}

function worldToSvgY(worldY: number, bounds: Bounds) {
  return padding + ((worldY - bounds.minWorldY) / (bounds.maxWorldY - bounds.minWorldY)) * (height - padding * 2);
}

function lonLatToWorldPixels(longitude: number, latitude: number, zoom: number): [number, number] {
  const scale = tileSize * 2 ** zoom;
  const boundedLatitude = Math.max(Math.min(latitude, 85.05112878), -85.05112878);
  const sinLatitude = Math.sin((boundedLatitude * Math.PI) / 180);
  const x = ((longitude + 180) / 360) * scale;
  const y = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale;

  return [x, y];
}

function extractPoints(feature: MapAssetFeature | MapContextFeature): [number, number][] {
  if (feature.geometry.type === "MultiPolygon") {
    return feature.geometry.coordinates.flat(2);
  }

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
