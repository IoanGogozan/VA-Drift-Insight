"use client";

import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import type { MapAssetFeature, MapContextFeature } from "@/lib/api";
import { riskColor } from "./risk-map-symbols";

export const center: [number, number] = [59.276, 10.415];

export function FitBounds({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds?.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
    }
  }, [bounds, map]);

  return null;
}

export function bindAssetLayer(feature: MapAssetFeature, layer: L.Layer, onSelectAsset: (feature: MapAssetFeature) => void) {
  layer.on("click", () => onSelectAsset(feature));
  layer.bindPopup(popupContent(feature));
}

export function popupContent(feature: MapAssetFeature) {
  const riskScore = feature.properties.riskScore;

  return `<strong>${escapeHtml(feature.properties.name)}</strong><br/>Type: ${escapeHtml(formatSubtype(feature.properties.subtype))}${riskScore === null ? "" : `<br/>Score: ${riskScore}/100`}`;
}

export function toFeatureCollection(features: Array<MapAssetFeature | MapContextFeature>) {
  return {
    type: "FeatureCollection" as const,
    features
  };
}

export function isPipe(feature: MapAssetFeature, pipeType: string) {
  return feature.properties.assetType === "pipe" && feature.properties.subtype === pipeType;
}

export function municipalityStyle() {
  return {
    color: "#344955",
    dashArray: "8 6",
    fillOpacity: 0.04,
    opacity: 0.8,
    weight: 2
  };
}

export function zoneStyle(feature: unknown, selectedId?: string | null) {
  const asset = feature as MapAssetFeature;
  const selected = asset.id === selectedId;

  return {
    color: selected ? "#111827" : riskColor(asset.properties.riskScore),
    fillColor: riskColor(asset.properties.riskScore),
    fillOpacity: selected ? 0.24 : 0.13,
    opacity: 0.95,
    weight: selected ? 3 : 1.5
  };
}

export function pipeStyle(feature: unknown, selectedId: string | null | undefined, color: string) {
  const asset = feature as MapAssetFeature;
  const selected = asset.id === selectedId;

  return {
    color,
    opacity: selected ? 1 : 0.86,
    weight: selected ? 6 : 3
  };
}

export function pointLatLng(feature: MapAssetFeature): [number, number] {
  if (feature.geometry.type !== "Point") {
    return center;
  }

  const [longitude, latitude] = feature.geometry.coordinates;
  return [latitude, longitude];
}

export function getLeafletBounds(features: Array<MapAssetFeature | MapContextFeature>) {
  const latLngs = features.flatMap(extractLatLngs);

  if (latLngs.length === 0) {
    return null;
  }

  return L.latLngBounds(latLngs);
}

function extractLatLngs(feature: MapAssetFeature | MapContextFeature): L.LatLngExpression[] {
  if (feature.geometry.type === "Point") {
    const [longitude, latitude] = feature.geometry.coordinates;
    return [[latitude, longitude]];
  }

  if (feature.geometry.type === "LineString") {
    return feature.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]);
  }

  if (feature.geometry.type === "MultiPolygon") {
    return feature.geometry.coordinates.flat(2).map(([longitude, latitude]) => [latitude, longitude]);
  }

  return feature.geometry.coordinates.flat().map(([longitude, latitude]) => [latitude, longitude]);
}

function formatSubtype(value: string) {
  const labels: Record<string, string> = {
    water_meter_zone: "Målesone",
    wastewater_catchment: "Avløpssone",
    water: "Vannledning",
    wastewater: "Avløpsledning",
    stormwater: "Overvannsledning",
    pump_station: "Pumpestasjon",
    leak: "Lekkasjehendelse",
    overflow: "Overløp",
    high_level_alarm: "Høy-nivå alarm"
  };

  return labels[value] ?? value;
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
