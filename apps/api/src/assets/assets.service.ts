import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

type MapAssetRow = {
  id: string;
  asset_type: "zone" | "pipe" | "pump_station" | "incident";
  name: string;
  subtype: string;
  geometry: string | null;
  risk_score: number | null;
};

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMapAssets() {
    const rows = await this.prisma.$queryRaw<MapAssetRow[]>`
      SELECT
        z.id::text AS id,
        'zone' AS asset_type,
        z.name,
        z.zone_type::text AS subtype,
        ST_AsGeoJSON(z.geometry)::text AS geometry,
        rs.score AS risk_score
      FROM zones z
      LEFT JOIN risk_scores rs
        ON rs.asset_id = z.id::text
       AND rs.asset_type = 'zone'
       AND rs.score_type IN ('leakage', 'fremmedvann')

      UNION ALL

      SELECT
        p.id::text AS id,
        'pipe' AS asset_type,
        p.pipe_code AS name,
        p.pipe_type::text AS subtype,
        ST_AsGeoJSON(p.geometry)::text AS geometry,
        rs.score AS risk_score
      FROM pipes p
      LEFT JOIN risk_scores rs
        ON rs.asset_id = p.id::text
       AND rs.asset_type = 'pipe'
       AND rs.score_type IN ('leakage', 'sanering')

      UNION ALL

      SELECT
        ps.id::text AS id,
        'pump_station' AS asset_type,
        ps.station_code || ' ' || ps.name AS name,
        'pump_station' AS subtype,
        ST_AsGeoJSON(ps.geometry)::text AS geometry,
        rs.score AS risk_score
      FROM pump_stations ps
      LEFT JOIN risk_scores rs
        ON rs.asset_id = ps.id::text
       AND rs.asset_type = 'pump_station'
       AND rs.score_type = 'fremmedvann'

      UNION ALL

      SELECT
        i.id::text AS id,
        'incident' AS asset_type,
        i.description AS name,
        i.incident_type::text AS subtype,
        ST_AsGeoJSON(i.geometry)::text AS geometry,
        NULL::integer AS risk_score
      FROM incidents i
      WHERE i.geometry IS NOT NULL
    `;

    return {
      type: "FeatureCollection",
      features: rows
        .filter((row) => row.geometry)
        .map((row) => ({
          type: "Feature",
          id: row.id,
          geometry: JSON.parse(row.geometry as string),
          properties: {
            assetType: row.asset_type,
            name: row.name,
            subtype: row.subtype,
            riskScore: row.risk_score
          }
        }))
    };
  }
}
