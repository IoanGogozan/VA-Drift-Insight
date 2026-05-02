"use client";

import { useMemo } from "react";
import { GeoJSON, LayersControl, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { MapAssetFeature, MapContextFeature } from "@/lib/api";
import {
  FitBounds,
  bindAssetLayer,
  center,
  getLeafletBounds,
  isPipe,
  municipalityStyle,
  pipeStyle,
  pointLatLng,
  popupContent,
  toFeatureCollection,
  zoneStyle
} from "./risk-map-leaflet-utils";
import { LegendDot, LegendLine, incidentIcon, pumpStationIcon } from "./risk-map-symbols";

export type RiskMapProps = {
  features: MapAssetFeature[];
  contextFeatures: MapContextFeature[];
  selectedId?: string | null;
  onSelectAsset: (feature: MapAssetFeature) => void;
};

export function RiskMapLeaflet({ features, contextFeatures, selectedId, onSelectAsset }: RiskMapProps) {
  const zones = features.filter((feature) => feature.properties.assetType === "zone");
  const waterPipes = features.filter((feature) => isPipe(feature, "water"));
  const wastewaterPipes = features.filter((feature) => isPipe(feature, "wastewater"));
  const stormwaterPipes = features.filter((feature) => isPipe(feature, "stormwater"));
  const pumpStations = features.filter((feature) => feature.properties.assetType === "pump_station");
  const incidents = features.filter((feature) => feature.properties.assetType === "incident");
  const bounds = useMemo(() => getLeafletBounds(features), [features]);

  return (
    <div className="border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-ink">VA-kart</h2>
        <div className="flex flex-wrap gap-3 text-xs text-muted">
          <LegendLine className="bg-[#2563eb]" label="Vannledning" />
          <LegendLine className="bg-[#7c2d12]" label="Avløp" />
          <LegendLine className="bg-[#0891b2]" label="Overvann" />
          <LegendDot className="bg-[#111827]" label="Pumpestasjon" />
          <LegendDot className="bg-riskHigh" label="Hendelse" />
        </div>
      </div>

      <div className="h-[560px] min-h-[420px] w-full">
        <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
          <FitBounds bounds={bounds} />
          <TileLayer
            attribution='&copy; <a href="https://www.kartverket.no/">Kartverket</a>'
            url="https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png"
          />
          <LayersControl position="topright">
            <LayersControl.Overlay checked name="Kommunegrense">
              <GeoJSON key={`context-${selectedId ?? "none"}`} data={toFeatureCollection(contextFeatures)} style={municipalityStyle} />
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Målesoner">
              <GeoJSON
                key={`zones-${selectedId ?? "none"}`}
                data={toFeatureCollection(zones)}
                style={(feature) => zoneStyle(feature, selectedId)}
                onEachFeature={(feature, layer) => bindAssetLayer(feature as MapAssetFeature, layer, onSelectAsset)}
              />
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Vannledninger">
              <GeoJSON
                key={`water-${selectedId ?? "none"}`}
                data={toFeatureCollection(waterPipes)}
                style={(feature) => pipeStyle(feature, selectedId, "#2563eb")}
                onEachFeature={(feature, layer) => bindAssetLayer(feature as MapAssetFeature, layer, onSelectAsset)}
              />
            </LayersControl.Overlay>
            <LayersControl.Overlay name="Avløpsledninger">
              <GeoJSON
                key={`wastewater-${selectedId ?? "none"}`}
                data={toFeatureCollection(wastewaterPipes)}
                style={(feature) => pipeStyle(feature, selectedId, "#7c2d12")}
                onEachFeature={(feature, layer) => bindAssetLayer(feature as MapAssetFeature, layer, onSelectAsset)}
              />
            </LayersControl.Overlay>
            <LayersControl.Overlay name="Overvannsledninger">
              <GeoJSON
                key={`stormwater-${selectedId ?? "none"}`}
                data={toFeatureCollection(stormwaterPipes)}
                style={(feature) => pipeStyle(feature, selectedId, "#0891b2")}
                onEachFeature={(feature, layer) => bindAssetLayer(feature as MapAssetFeature, layer, onSelectAsset)}
              />
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Pumpestasjoner">
              {pumpStations.map((feature) => (
                <Marker
                  key={feature.id}
                  position={pointLatLng(feature)}
                  icon={pumpStationIcon(feature.id === selectedId, feature.properties.riskScore)}
                  eventHandlers={{ click: () => onSelectAsset(feature) }}
                >
                  <Popup>{popupContent(feature)}</Popup>
                </Marker>
              ))}
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Hendelser">
              {incidents.map((feature) => (
                <Marker
                  key={feature.id}
                  position={pointLatLng(feature)}
                  icon={incidentIcon(feature.properties.subtype)}
                  eventHandlers={{ click: () => onSelectAsset(feature) }}
                >
                  <Popup>{popupContent(feature)}</Popup>
                </Marker>
              ))}
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>

      <div className="border-t border-slate-200 px-4 py-2 text-xs text-muted">
        Bakgrunnskart: Kartverket topo WMTS. VA-nett, hendelser og driftsdata er simulert demo-data.
      </div>
    </div>
  );
}
