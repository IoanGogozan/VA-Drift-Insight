import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ids = {
  zoneNorth: "11111111-1111-4111-8111-111111111111",
  zoneSentrum: "22222222-2222-4222-8222-222222222222",
  zoneSouth: "33333333-3333-4333-8333-333333333333",
  catchmentA: "44444444-4444-4444-8444-444444444444",
  catchmentB: "55555555-5555-4555-8555-555555555555",
  catchmentC: "66666666-6666-4666-8666-666666666666",
  pipe141: "77777777-7777-4777-8777-777777777777",
  pipe203: "88888888-8888-4888-8888-888888888888",
  pipe312: "99999999-9999-4999-8999-999999999999",
  pumpStation01: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  pumpStation02: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  pumpStation03: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  pumpStation04: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  pumpStation05: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  municipalityTonsberg: "30000000-0000-4000-8000-000000000001",
  incidentLeakNorth: "10000000-0000-4000-8000-000000000001",
  incidentAlarmPs03: "10000000-0000-4000-8000-000000000002",
  incidentOverflowPs03: "10000000-0000-4000-8000-000000000003",
  recommendationLeakageNorth: "20000000-0000-4000-8000-000000000001",
  recommendationFremmedvannPs03: "20000000-0000-4000-8000-000000000002"
};

async function main() {
  await prisma.$transaction([
    prisma.externalDataSource.deleteMany(),
    prisma.weatherObservation.deleteMany(),
    prisma.municipality.deleteMany(),
    prisma.recommendation.deleteMany(),
    prisma.riskScore.deleteMany(),
    prisma.incident.deleteMany(),
    prisma.timeSeries.deleteMany(),
    prisma.pumpStation.deleteMany(),
    prisma.pipe.deleteMany(),
    prisma.zone.deleteMany()
  ]);

  await prisma.zone.createMany({
    data: [
      {
        id: ids.zoneNorth,
        name: "Målesone Nord",
        zoneType: "water_meter_zone",
        population: 4200,
        baselineNightFlow: 18,
        currentNightFlow: 21.1,
        dataQualityScore: 72
      },
      {
        id: ids.zoneSentrum,
        name: "Målesone Sentrum",
        zoneType: "water_meter_zone",
        population: 6100,
        baselineNightFlow: 24,
        currentNightFlow: 25.4,
        dataQualityScore: 68
      },
      {
        id: ids.zoneSouth,
        name: "Målesone Sør",
        zoneType: "water_meter_zone",
        population: 2900,
        baselineNightFlow: 11,
        currentNightFlow: 11.4,
        dataQualityScore: 84
      },
      {
        id: ids.catchmentA,
        name: "Avløpssone A",
        zoneType: "wastewater_catchment",
        population: 5200,
        dataQualityScore: 78
      },
      {
        id: ids.catchmentB,
        name: "Avløpssone B",
        zoneType: "wastewater_catchment",
        population: 3800,
        dataQualityScore: 75
      },
      {
        id: ids.catchmentC,
        name: "Avløpssone C",
        zoneType: "wastewater_catchment",
        population: 2500,
        dataQualityScore: 69
      }
    ]
  });

  await prisma.pipe.createMany({
    data: [
      {
        id: ids.pipe141,
        pipeCode: "Ledning 141",
        zoneId: ids.zoneNorth,
        material: "støpejern",
        installedYear: 1974,
        diameterMm: 160,
        pipeType: "water",
        criticality: 75,
        previousBreaks: 2
      },
      {
        id: ids.pipe203,
        pipeCode: "Ledning 203",
        zoneId: ids.zoneSentrum,
        material: "duktilt støpejern",
        installedYear: 1992,
        diameterMm: 200,
        pipeType: "water",
        criticality: 70,
        previousBreaks: 1
      },
      {
        id: ids.pipe312,
        pipeCode: "Ledning 312",
        zoneId: ids.zoneSouth,
        material: "PE",
        installedYear: 2016,
        diameterMm: 110,
        pipeType: "water",
        criticality: 35,
        previousBreaks: 0
      }
    ]
  });

  await prisma.pumpStation.createMany({
    data: [
      {
        id: ids.pumpStation01,
        stationCode: "PS-01",
        name: "Sentrum",
        catchmentId: ids.catchmentA,
        capacityM3h: 220,
        alarmCount: 3,
        overflowEvents: 1
      },
      {
        id: ids.pumpStation02,
        stationCode: "PS-02",
        name: "Havna",
        catchmentId: ids.catchmentA,
        capacityM3h: 260,
        alarmCount: 1,
        overflowEvents: 0
      },
      {
        id: ids.pumpStation03,
        stationCode: "PS-03",
        name: "Skoglia",
        catchmentId: ids.catchmentB,
        capacityM3h: 180,
        alarmCount: 7,
        overflowEvents: 2
      },
      {
        id: ids.pumpStation04,
        stationCode: "PS-04",
        name: "Industriveien",
        catchmentId: ids.catchmentB,
        capacityM3h: 300,
        alarmCount: 2,
        overflowEvents: 0
      },
      {
        id: ids.pumpStation05,
        stationCode: "PS-05",
        name: "Nordbekken",
        catchmentId: ids.catchmentC,
        capacityM3h: 140,
        alarmCount: 5,
        overflowEvents: 1
      }
    ]
  });

  await prisma.incident.createMany({
    data: [
      {
        id: ids.incidentLeakNorth,
        incidentType: "leak",
        assetType: "zone",
        assetId: ids.zoneNorth,
        occurredAt: new Date("2026-03-15T08:30:00.000Z"),
        description: "Tidligere lekkasje i nærheten av gate X"
      },
      {
        id: ids.incidentAlarmPs03,
        incidentType: "high_level_alarm",
        assetType: "pump_station",
        assetId: ids.pumpStation03,
        occurredAt: new Date("2026-04-19T21:15:00.000Z"),
        description: "Høy-nivå alarm ved våtvær"
      },
      {
        id: ids.incidentOverflowPs03,
        incidentType: "overflow",
        assetType: "pump_station",
        assetId: ids.pumpStation03,
        occurredAt: new Date("2026-04-20T00:10:00.000Z"),
        description: "Kort overløpshendelse etter kraftig nedbør"
      }
    ]
  });

  await prisma.riskScore.createMany({
    data: [
      {
        assetType: "zone",
        assetId: ids.zoneNorth,
        scoreType: "leakage",
        score: 82,
        confidence: 76,
        explanation: "Risikoen er høy fordi nattforbruket har økt, flere ledninger er eldre enn 45 år, og det finnes tidligere lekkasjer i nærheten."
      },
      {
        assetType: "zone",
        assetId: ids.zoneSentrum,
        scoreType: "leakage",
        score: 58,
        confidence: 68,
        explanation: "Risikoen er middels på grunn av blandet materialkvalitet og enkelte datahull."
      },
      {
        assetType: "zone",
        assetId: ids.zoneSouth,
        scoreType: "leakage",
        score: 28,
        confidence: 84,
        explanation: "Risikoen er lavere fordi ledningene er nyere og datakvaliteten er god."
      },
      {
        assetType: "pump_station",
        assetId: ids.pumpStation03,
        scoreType: "fremmedvann",
        score: 86,
        confidence: 78,
        explanation: "Pumpetiden øker tydelig etter nedbør og holder seg forhøyet etter at regnet stopper."
      },
      {
        assetType: "pump_station",
        assetId: ids.pumpStation01,
        scoreType: "fremmedvann",
        score: 64,
        confidence: 72,
        explanation: "Pumpestasjonen viser noe regnrespons, men mønsteret er mindre tydelig enn PS-03."
      }
    ]
  });

  await prisma.recommendation.createMany({
    data: [
      {
        id: ids.recommendationLeakageNorth,
        type: "leakage",
        priority: "high",
        assetType: "zone",
        assetId: ids.zoneNorth,
        areaName: "Målesone Nord",
        reason: "Økt nattforbruk",
        suggestedAction: "Akustisk lekkasjesøk og ventilkontroll",
        status: "new"
      },
      {
        id: ids.recommendationFremmedvannPs03,
        type: "fremmedvann",
        priority: "high",
        assetType: "pump_station",
        assetId: ids.pumpStation03,
        areaName: "PS-03 Skoglia",
        reason: "Regnkorrelasjon",
        suggestedAction: "CCTV/røyktest i oppstrøms delområde",
        status: "new"
      }
    ]
  });

  await prisma.externalDataSource.createMany({
    data: [
      {
        sourceKey: "met-frost",
        name: "MET Norway Frost API",
        url: "https://frost.met.no/",
        description: "Historical precipitation data used for fremmedvann rainfall context.",
        isMvp: true
      },
      {
        sourceKey: "kartverket-grensedata",
        name: "Kartverket grensedata / Geonorge kommunegrenser",
        url: "https://www.kartverket.no/api-og-data/grensedata",
        description: "Official municipality boundary data used as map context.",
        isMvp: true
      },
      {
        sourceKey: "ssb-kostra",
        name: "SSB/KOSTRA",
        url: "https://www.ssb.no/api/pxwebapi",
        description: "Optional Phase 2 municipality water and wastewater statistics.",
        isMvp: false
      }
    ]
  });

  await prisma.municipality.create({
    data: {
      id: ids.municipalityTonsberg,
      municipalityCode: "3905",
      name: "Tonsberg kommune",
      source: "Kartverket grensedata / Geonorge kommunegrenser fallback"
    }
  });

  await prisma.weatherObservation.createMany({
    data: createFallbackWeatherObservations()
  });

  await setDemoGeometry();
}

function createFallbackWeatherObservations() {
  const rainfallByDay = [0, 0.8, 2.4, 8.2, 14.6, 6.4, 1.2, 0, 0, 3.1, 9.8, 4.7, 0.4, 0];

  return rainfallByDay.map((rainfallMm, index) => ({
    source: "MET Norway Frost API fallback",
    stationId: "SN27450",
    stationName: "Tonsberg - demo station",
    municipalityCode: "3905",
    observedAt: new Date(Date.UTC(2026, 3, 15 + index, 6, 0, 0)),
    rainfallMm,
    temperatureC: Number((7.5 + index * 0.25).toFixed(1)),
    qualityCode: "0"
  }));
}

async function setDemoGeometry() {
  await prisma.$executeRaw`
    UPDATE municipalities
    SET geometry = ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(${
      '{"type":"Polygon","coordinates":[[[10.300,59.200],[10.550,59.200],[10.550,59.360],[10.300,59.360],[10.300,59.200]]]}'
    }), 4326))
    WHERE id = ${ids.municipalityTonsberg}::uuid
  `;

  const geometries = [
    [
      "zones",
      ids.zoneNorth,
      '{"type":"Polygon","coordinates":[[[10.382,59.285],[10.405,59.285],[10.405,59.300],[10.382,59.300],[10.382,59.285]]]}'
    ],
    [
      "zones",
      ids.zoneSentrum,
      '{"type":"Polygon","coordinates":[[[10.405,59.270],[10.430,59.270],[10.430,59.284],[10.405,59.284],[10.405,59.270]]]}'
    ],
    [
      "zones",
      ids.zoneSouth,
      '{"type":"Polygon","coordinates":[[[10.385,59.250],[10.412,59.250],[10.412,59.265],[10.385,59.265],[10.385,59.250]]]}'
    ],
    [
      "zones",
      ids.catchmentA,
      '{"type":"Polygon","coordinates":[[[10.430,59.270],[10.455,59.270],[10.455,59.288],[10.430,59.288],[10.430,59.270]]]}'
    ],
    [
      "zones",
      ids.catchmentB,
      '{"type":"Polygon","coordinates":[[[10.412,59.248],[10.440,59.248],[10.440,59.268],[10.412,59.268],[10.412,59.248]]]}'
    ],
    [
      "zones",
      ids.catchmentC,
      '{"type":"Polygon","coordinates":[[[10.360,59.265],[10.382,59.265],[10.382,59.286],[10.360,59.286],[10.360,59.265]]]}'
    ]
  ] as const;

  for (const [table, id, geometry] of geometries) {
    await prisma.$executeRawUnsafe(
      `UPDATE ${table} SET geometry = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) WHERE id = $2::uuid`,
      geometry,
      id
    );
  }

  const pipeGeometries = [
    [ids.pipe141, '{"type":"LineString","coordinates":[[10.386,59.294],[10.398,59.295],[10.403,59.289]]}'],
    [ids.pipe203, '{"type":"LineString","coordinates":[[10.410,59.280],[10.423,59.279],[10.428,59.273]]}'],
    [ids.pipe312, '{"type":"LineString","coordinates":[[10.389,59.257],[10.401,59.259],[10.409,59.262]]}']
  ] as const;

  for (const [id, geometry] of pipeGeometries) {
    await prisma.$executeRaw`
      UPDATE pipes
      SET geometry = ST_SetSRID(ST_GeomFromGeoJSON(${geometry}), 4326)
      WHERE id = ${id}::uuid
    `;
  }

  const pumpStationGeometries = [
    [ids.pumpStation01, '{"type":"Point","coordinates":[10.443,59.281]}'],
    [ids.pumpStation02, '{"type":"Point","coordinates":[10.452,59.276]}'],
    [ids.pumpStation03, '{"type":"Point","coordinates":[10.425,59.258]}'],
    [ids.pumpStation04, '{"type":"Point","coordinates":[10.437,59.263]}'],
    [ids.pumpStation05, '{"type":"Point","coordinates":[10.370,59.276]}']
  ] as const;

  for (const [id, geometry] of pumpStationGeometries) {
    await prisma.$executeRaw`
      UPDATE pump_stations
      SET geometry = ST_SetSRID(ST_GeomFromGeoJSON(${geometry}), 4326)
      WHERE id = ${id}::uuid
    `;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
