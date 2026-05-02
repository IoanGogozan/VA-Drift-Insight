import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../database/prisma.service";

type MunicipalityRow = {
  id: string;
  municipality_code: string;
  name: string;
  source: string;
  geometry: string | null;
};

@Injectable()
export class MunicipalityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async getDefaultMunicipality() {
    const row = await this.findDefaultMunicipality();

    return {
      id: row.id,
      municipalityCode: row.municipality_code,
      name: row.name,
      source: row.source,
      geometry: row.geometry ? JSON.parse(row.geometry) : null
    };
  }

  async getMapContext() {
    const municipality = await this.getDefaultMunicipality();

    return {
      type: "FeatureCollection",
      features: municipality.geometry
        ? [
            {
              type: "Feature",
              id: municipality.id,
              geometry: municipality.geometry,
              properties: {
                assetType: "municipality",
                municipalityCode: municipality.municipalityCode,
                name: municipality.name,
                source: municipality.source
              }
            }
          ]
        : []
    };
  }

  private async findDefaultMunicipality() {
    const municipalityCode = this.config.get<string>("DEFAULT_MUNICIPALITY_CODE") ?? "3905";
    const rows = await this.prisma.$queryRaw<MunicipalityRow[]>`
      SELECT
        id::text,
        municipality_code,
        name,
        source,
        ST_AsGeoJSON(geometry)::text AS geometry
      FROM municipalities
      WHERE municipality_code = ${municipalityCode}
      LIMIT 1
    `;
    const row = rows[0];

    if (!row) {
      throw new NotFoundException("Municipality context was not found.");
    }

    return row;
  }
}
