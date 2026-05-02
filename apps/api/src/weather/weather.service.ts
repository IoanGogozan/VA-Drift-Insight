import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { FrostClient, FrostObservation } from "../external-data/met/frost-client";

type RainfallQuery = {
  municipalityCode?: string;
  from?: string;
  to?: string;
};

type FrostImportQuery = RainfallQuery & {
  stationId?: string;
};

@Injectable()
export class WeatherService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly frostClient: FrostClient,
    private readonly config: ConfigService
  ) {}

  async getRainfall(query: RainfallQuery) {
    const { municipalityCode, from, to } = this.normalizeRainfallQuery(query);
    const observations = await this.prisma.weatherObservation.findMany({
      where: {
        municipalityCode,
        observedAt: {
          gte: from,
          lte: to
        }
      },
      orderBy: { observedAt: "asc" }
    });

    return {
      municipalityCode,
      from,
      to,
      source: observations[0]?.source ?? "MET Norway Frost API fallback",
      observations: observations.map((observation) => ({
        id: observation.id,
        stationId: observation.stationId,
        stationName: observation.stationName,
        observedAt: observation.observedAt,
        rainfallMm: observation.rainfallMm,
        temperatureC: observation.temperatureC,
        qualityCode: observation.qualityCode
      }))
    };
  }

  async importFrostRainfall(query: FrostImportQuery) {
    const { municipalityCode, from, to } = this.normalizeRainfallQuery(query);
    const stationId = query.stationId ?? "SN27450";
    const observations = await this.frostClient.fetchRainfall({
      stationId,
      stationName: "Tonsberg - Frost station",
      from: toDateString(from),
      to: toDateString(to)
    });

    for (const observation of observations) {
      await this.upsertObservation(municipalityCode, observation);
    }

    return {
      importType: "weather_frost",
      source: "MET Norway Frost API",
      municipalityCode,
      stationId,
      from,
      to,
      acceptedRows: observations.length,
      rejectedRows: 0
    };
  }

  private normalizeRainfallQuery(query: RainfallQuery) {
    const municipalityCode =
      query.municipalityCode ?? this.config.get<string>("DEFAULT_MUNICIPALITY_CODE") ?? "3905";
    const to = query.to ? parseDate(query.to, "to") : new Date("2026-04-29T23:59:59.999Z");
    const from = query.from ? parseDate(query.from, "from") : new Date("2026-04-15T00:00:00.000Z");

    if (from > to) {
      throw new BadRequestException("from must be before to.");
    }

    return { municipalityCode, from, to };
  }

  private async upsertObservation(municipalityCode: string, observation: FrostObservation) {
    await this.prisma.weatherObservation.upsert({
      where: {
        source_stationId_observedAt: {
          source: "MET Norway Frost API",
          stationId: observation.stationId,
          observedAt: observation.observedAt
        }
      },
      create: toObservationCreateInput(municipalityCode, observation),
      update: {
        stationName: observation.stationName,
        municipalityCode,
        rainfallMm: observation.rainfallMm,
        temperatureC: observation.temperatureC,
        qualityCode: observation.qualityCode
      }
    });
  }
}

function parseDate(value: string, field: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${field} must be a valid date.`);
  }

  return date;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toObservationCreateInput(
  municipalityCode: string,
  observation: FrostObservation
): Prisma.WeatherObservationCreateInput {
  return {
    source: "MET Norway Frost API",
    stationId: observation.stationId,
    stationName: observation.stationName,
    municipalityCode,
    observedAt: observation.observedAt,
    rainfallMm: observation.rainfallMm,
    temperatureC: observation.temperatureC,
    qualityCode: observation.qualityCode
  };
}
