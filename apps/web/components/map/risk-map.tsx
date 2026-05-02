"use client";

import dynamic from "next/dynamic";
import type { RiskMapProps } from "./risk-map-leaflet";

const RiskMapLeaflet = dynamic(() => import("./risk-map-leaflet").then((module) => module.RiskMapLeaflet), {
  ssr: false,
  loading: () => (
    <div className="border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-ink">VA-kart</h2>
      </div>
      <div className="grid h-[560px] min-h-[420px] place-items-center bg-slate-50 text-sm text-muted">
        Laster VA-kart...
      </div>
    </div>
  )
});

export function RiskMap(props: RiskMapProps) {
  return <RiskMapLeaflet {...props} />;
}
