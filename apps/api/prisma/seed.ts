import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
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
        id: "zone-north",
        name: "Målesone Nord",
        zoneType: "water_meter_zone",
        population: 4200,
        baselineNightFlow: 18,
        currentNightFlow: 21.1,
        dataQualityScore: 72
      },
      {
        id: "zone-sentrum",
        name: "Målesone Sentrum",
        zoneType: "water_meter_zone",
        population: 6100,
        baselineNightFlow: 24,
        currentNightFlow: 25.4,
        dataQualityScore: 68
      },
      {
        id: "zone-south",
        name: "Målesone Sør",
        zoneType: "water_meter_zone",
        population: 2900,
        baselineNightFlow: 11,
        currentNightFlow: 11.4,
        dataQualityScore: 84
      },
      {
        id: "catchment-a",
        name: "Avløpssone A",
        zoneType: "wastewater_catchment",
        population: 5200,
        dataQualityScore: 78
      },
      {
        id: "catchment-b",
        name: "Avløpssone B",
        zoneType: "wastewater_catchment",
        population: 3800,
        dataQualityScore: 75
      },
      {
        id: "catchment-c",
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
        id: "pipe-141",
        pipeCode: "Ledning 141",
        zoneId: "zone-north",
        material: "støpejern",
        installedYear: 1974,
        diameterMm: 160,
        pipeType: "water",
        criticality: 75,
        previousBreaks: 2
      },
      {
        id: "pipe-203",
        pipeCode: "Ledning 203",
        zoneId: "zone-sentrum",
        material: "duktilt støpejern",
        installedYear: 1992,
        diameterMm: 200,
        pipeType: "water",
        criticality: 70,
        previousBreaks: 1
      },
      {
        id: "pipe-312",
        pipeCode: "Ledning 312",
        zoneId: "zone-south",
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
        id: "ps-01",
        stationCode: "PS-01",
        name: "Sentrum",
        catchmentId: "catchment-a",
        capacityM3h: 220,
        alarmCount: 3,
        overflowEvents: 1
      },
      {
        id: "ps-02",
        stationCode: "PS-02",
        name: "Havna",
        catchmentId: "catchment-a",
        capacityM3h: 260,
        alarmCount: 1,
        overflowEvents: 0
      },
      {
        id: "ps-03",
        stationCode: "PS-03",
        name: "Skoglia",
        catchmentId: "catchment-b",
        capacityM3h: 180,
        alarmCount: 7,
        overflowEvents: 2
      },
      {
        id: "ps-04",
        stationCode: "PS-04",
        name: "Industriveien",
        catchmentId: "catchment-b",
        capacityM3h: 300,
        alarmCount: 2,
        overflowEvents: 0
      },
      {
        id: "ps-05",
        stationCode: "PS-05",
        name: "Nordbekken",
        catchmentId: "catchment-c",
        capacityM3h: 140,
        alarmCount: 5,
        overflowEvents: 1
      }
    ]
  });

  await prisma.incident.createMany({
    data: [
      {
        id: "incident-leak-north-1",
        incidentType: "leak",
        assetType: "zone",
        assetId: "zone-north",
        occurredAt: new Date("2026-03-15T08:30:00.000Z"),
        description: "Tidligere lekkasje i nærheten av gate X"
      },
      {
        id: "incident-alarm-ps03-1",
        incidentType: "high_level_alarm",
        assetType: "pump_station",
        assetId: "ps-03",
        occurredAt: new Date("2026-04-19T21:15:00.000Z"),
        description: "Høy-nivå alarm ved våtvær"
      },
      {
        id: "incident-overflow-ps03-1",
        incidentType: "overflow",
        assetType: "pump_station",
        assetId: "ps-03",
        occurredAt: new Date("2026-04-20T00:10:00.000Z"),
        description: "Kort overløpshendelse etter kraftig nedbør"
      }
    ]
  });

  await prisma.riskScore.createMany({
    data: [
      {
        assetType: "zone",
        assetId: "zone-north",
        scoreType: "leakage",
        score: 82,
        confidence: 76,
        explanation: "Risikoen er høy fordi nattforbruket har økt, flere ledninger er eldre enn 45 år, og det finnes tidligere lekkasjer i nærheten."
      },
      {
        assetType: "zone",
        assetId: "zone-sentrum",
        scoreType: "leakage",
        score: 58,
        confidence: 68,
        explanation: "Risikoen er middels på grunn av blandet materialkvalitet og enkelte datahull."
      },
      {
        assetType: "zone",
        assetId: "zone-south",
        scoreType: "leakage",
        score: 28,
        confidence: 84,
        explanation: "Risikoen er lavere fordi ledningene er nyere og datakvaliteten er god."
      },
      {
        assetType: "pump_station",
        assetId: "ps-03",
        scoreType: "fremmedvann",
        score: 86,
        confidence: 78,
        explanation: "Pumpetiden øker tydelig etter nedbør og holder seg forhøyet etter at regnet stopper."
      },
      {
        assetType: "pump_station",
        assetId: "ps-01",
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
        id: "rec-leakage-north",
        type: "leakage",
        priority: "high",
        assetType: "zone",
        assetId: "zone-north",
        areaName: "Målesone Nord",
        reason: "Økt nattforbruk",
        suggestedAction: "Akustisk lekkasjesøk og ventilkontroll",
        status: "new"
      },
      {
        id: "rec-fremmedvann-ps03",
        type: "fremmedvann",
        priority: "high",
        assetType: "pump_station",
        assetId: "ps-03",
        areaName: "PS-03 Skoglia",
        reason: "Regnkorrelasjon",
        suggestedAction: "CCTV/røyktest i oppstrøms delområde",
        status: "new"
      }
    ]
  });

  await setDemoGeometry();
}

async function setDemoGeometry() {
  const geometries = [
    [
      "zones",
      "zone-north",
      '{"type":"Polygon","coordinates":[[[10.710,59.930],[10.725,59.930],[10.725,59.940],[10.710,59.940],[10.710,59.930]]]}'
    ],
    [
      "zones",
      "zone-sentrum",
      '{"type":"Polygon","coordinates":[[[10.725,59.920],[10.742,59.920],[10.742,59.932],[10.725,59.932],[10.725,59.920]]]}'
    ],
    [
      "zones",
      "zone-south",
      '{"type":"Polygon","coordinates":[[[10.712,59.908],[10.730,59.908],[10.730,59.920],[10.712,59.920],[10.712,59.908]]]}'
    ],
    [
      "zones",
      "catchment-a",
      '{"type":"Polygon","coordinates":[[[10.742,59.920],[10.758,59.920],[10.758,59.934],[10.742,59.934],[10.742,59.920]]]}'
    ],
    [
      "zones",
      "catchment-b",
      '{"type":"Polygon","coordinates":[[[10.730,59.905],[10.748,59.905],[10.748,59.920],[10.730,59.920],[10.730,59.905]]]}'
    ],
    [
      "zones",
      "catchment-c",
      '{"type":"Polygon","coordinates":[[[10.700,59.914],[10.712,59.914],[10.712,59.928],[10.700,59.928],[10.700,59.914]]]}'
    ]
  ] as const;

  for (const [table, id, geometry] of geometries) {
    await prisma.$executeRawUnsafe(
      `UPDATE ${table} SET geometry = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) WHERE id = $2`,
      geometry,
      id
    );
  }

  const pipeGeometries = [
    [
      "pipe-141",
      '{"type":"LineString","coordinates":[[10.713,59.935],[10.722,59.936],[10.724,59.932]]}'
    ],
    [
      "pipe-203",
      '{"type":"LineString","coordinates":[[10.728,59.928],[10.736,59.927],[10.740,59.923]]}'
    ],
    [
      "pipe-312",
      '{"type":"LineString","coordinates":[[10.715,59.914],[10.723,59.916],[10.728,59.918]]}'
    ]
  ] as const;

  for (const [id, geometry] of pipeGeometries) {
    await prisma.$executeRaw`
      UPDATE pipes
      SET geometry = ST_SetSRID(ST_GeomFromGeoJSON(${geometry}), 4326)
      WHERE id = ${id}
    `;
  }

  const pumpStationGeometries = [
    ["ps-01", '{"type":"Point","coordinates":[10.751,59.928]}'],
    ["ps-02", '{"type":"Point","coordinates":[10.756,59.924]}'],
    ["ps-03", '{"type":"Point","coordinates":[10.739,59.913]}'],
    ["ps-04", '{"type":"Point","coordinates":[10.746,59.917]}'],
    ["ps-05", '{"type":"Point","coordinates":[10.706,59.923]}']
  ] as const;

  for (const [id, geometry] of pumpStationGeometries) {
    await prisma.$executeRaw`
      UPDATE pump_stations
      SET geometry = ST_SetSRID(ST_GeomFromGeoJSON(${geometry}), 4326)
      WHERE id = ${id}
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
