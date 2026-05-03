export type WaterZoneStatus = "normal" | "suspect" | "high";

export type WaterLossInput = {
  currentNightFlowM3h: number;
  baselineNightFlowM3h: number;
};

export type WaterLossResult = {
  estimatedLossM3Day: number;
  nightFlowDeltaPercent: number;
  status: WaterZoneStatus;
};

export function calculateWaterLoss(input: WaterLossInput): WaterLossResult {
  const flowDelta = Math.max(0, input.currentNightFlowM3h - input.baselineNightFlowM3h);
  const estimatedLossM3Day = round(flowDelta * 24, 1);
  const nightFlowDeltaPercent =
    input.baselineNightFlowM3h > 0 ? round((flowDelta / input.baselineNightFlowM3h) * 100, 1) : 0;

  return {
    estimatedLossM3Day,
    nightFlowDeltaPercent,
    status: getWaterZoneStatus(nightFlowDeltaPercent)
  };
}

export function getWaterZoneStatus(nightFlowDeltaPercent: number): WaterZoneStatus {
  if (nightFlowDeltaPercent > 20) {
    return "high";
  }

  if (nightFlowDeltaPercent >= 10) {
    return "suspect";
  }

  return "normal";
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
