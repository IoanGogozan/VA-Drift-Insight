import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export type FrostObservation = {
  stationId: string;
  stationName?: string;
  observedAt: Date;
  rainfallMm: number | null;
  temperatureC: number | null;
  qualityCode: string | null;
};

type FrostApiResponse = {
  data?: Array<{
    sourceId: string;
    referenceTime: string;
    observations: Array<{
      elementId: string;
      value: number;
      qualityCode?: string;
    }>;
  }>;
};

@Injectable()
export class FrostClient {
  constructor(private readonly config: ConfigService) {}

  async fetchRainfall(params: {
    stationId: string;
    from: string;
    to: string;
    stationName?: string;
  }): Promise<FrostObservation[]> {
    const clientId = this.config.get<string>("FROST_CLIENT_ID");

    if (!clientId) {
      throw new ServiceUnavailableException("Frost client ID is not configured.");
    }

    const url = new URL("https://frost.met.no/observations/v0.jsonld");
    url.searchParams.set("sources", params.stationId);
    url.searchParams.set("referencetime", `${params.from}/${params.to}`);
    url.searchParams.set("elements", "sum(precipitation_amount P1D),mean(air_temperature P1D)");
    url.searchParams.set("timeoffsets", "default");
    url.searchParams.set("qualities", "0,1,2,3,4");

    const response = await fetch(url, {
      headers: {
        authorization: `Basic ${Buffer.from(`${clientId}:`).toString("base64")}`
      }
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(`Frost API request failed with status ${response.status}.`);
    }

    return normalizeFrostResponse((await response.json()) as FrostApiResponse, params.stationName);
  }
}

export function normalizeFrostResponse(response: FrostApiResponse, stationName?: string): FrostObservation[] {
  return (response.data ?? []).map((item) => {
    const rainfall = item.observations.find((observation) =>
      observation.elementId.includes("precipitation_amount")
    );
    const temperature = item.observations.find((observation) => observation.elementId.includes("air_temperature"));

    return {
      stationId: item.sourceId.split(":")[0] ?? item.sourceId,
      stationName,
      observedAt: new Date(item.referenceTime),
      rainfallMm: rainfall?.value ?? null,
      temperatureC: temperature?.value ?? null,
      qualityCode: rainfall?.qualityCode ?? temperature?.qualityCode ?? null
    };
  });
}
