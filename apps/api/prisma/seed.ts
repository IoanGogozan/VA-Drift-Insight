import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ids = {
  zoneNorth: "11111111-1111-4111-8111-111111111111",
  zoneSentrum: "22222222-2222-4222-8222-222222222222",
  zoneSouth: "33333333-3333-4333-8333-333333333333",
  waterZoneNorth: "31111111-1111-4111-8111-111111111111",
  waterZoneSentrum: "32222222-2222-4222-8222-222222222222",
  waterZoneSouth: "33333333-0000-4333-8333-333333333333",
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
  incidentComplaintNorth: "10000000-0000-4000-8000-000000000004",
  recommendationLeakageNorth: "20000000-0000-4000-8000-000000000001",
  recommendationFremmedvannPs03: "20000000-0000-4000-8000-000000000002"
};

async function main() {
  await prisma.$executeRaw`DELETE FROM network_nodes`;

  await prisma.$transaction([
    prisma.importValidationError.deleteMany(),
    prisma.importRun.deleteMany(),
    prisma.externalDataSource.deleteMany(),
    prisma.weatherObservation.deleteMany(),
    prisma.municipality.deleteMany(),
    prisma.recommendation.deleteMany(),
    prisma.riskScore.deleteMany(),
    prisma.incident.deleteMany(),
    prisma.timeSeries.deleteMany(),
    prisma.pumpStation.deleteMany(),
    prisma.pipe.deleteMany(),
    prisma.waterZone.deleteMany(),
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
        currentNightFlow: 22.1,
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
    data: createPipeSeedData()
  });

  await prisma.waterZone.createMany({
    data: [
      createWaterZoneSeedData({
        id: ids.waterZoneNorth,
        zoneId: ids.zoneNorth,
        name: "Målesone Nord",
        totalConsumptionM3Day: 1840,
        nightFlowM3h: 22.1,
        baselineNightFlowM3h: 18,
        trend7d: 6.4,
        trend30d: 22.8
      }),
      createWaterZoneSeedData({
        id: ids.waterZoneSentrum,
        zoneId: ids.zoneSentrum,
        name: "Målesone Sentrum",
        totalConsumptionM3Day: 2620,
        nightFlowM3h: 25.4,
        baselineNightFlowM3h: 24,
        trend7d: 1.8,
        trend30d: 5.8
      }),
      createWaterZoneSeedData({
        id: ids.waterZoneSouth,
        zoneId: ids.zoneSouth,
        name: "Målesone Sør",
        totalConsumptionM3Day: 980,
        nightFlowM3h: 11.4,
        baselineNightFlowM3h: 11,
        trend7d: -0.6,
        trend30d: 3.6
      })
    ]
  });

  await seedNetworkNodes();

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
        id: ids.incidentComplaintNorth,
        incidentType: "complaint",
        assetType: "zone",
        assetId: ids.zoneNorth,
        occurredAt: new Date("2026-04-02T12:10:00.000Z"),
        description: "Kundemelding om lavt trykk og mulig lekkasje"
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
        explanation: "Målesone Nord har 22.8 % økning i nattforbruk sammenlignet med baseline, eldre ledninger og registrerte lekkasjehendelser."
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

function createWaterZoneSeedData(input: {
  id: string;
  zoneId: string;
  name: string;
  totalConsumptionM3Day: number;
  nightFlowM3h: number;
  baselineNightFlowM3h: number;
  trend7d: number;
  trend30d: number;
}) {
  const flowDelta = Math.max(0, input.nightFlowM3h - input.baselineNightFlowM3h);
  const nightFlowDeltaPercent =
    input.baselineNightFlowM3h > 0 ? (flowDelta / input.baselineNightFlowM3h) * 100 : 0;

  return {
    ...input,
    estimatedLossM3Day: Number((flowDelta * 24).toFixed(1)),
    status: nightFlowDeltaPercent > 20 ? ("high" as const) : nightFlowDeltaPercent >= 10 ? ("suspect" as const) : ("normal" as const)
  };
}

function createPipeSeedData() {
  const basePipes = [
      {
        id: ids.pipe141,
      pipeCode: "Ledning 141",
      zoneId: ids.zoneNorth,
      material: "støpejern",
      installedYear: 1974,
      diameterMm: 160,
        pipeType: "water" as const,
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
        pipeType: "water" as const,
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
        pipeType: "water" as const,
      criticality: 35,
      previousBreaks: 0
    }
  ];

  const generatedPipes = createNetworkSegments().map((segment, index) => ({
    pipeCode: `Demo-${segment.pipeType}-${String(index + 1).padStart(2, "0")}`,
    zoneId: segment.zoneId,
    material: segment.material,
    installedYear: segment.installedYear,
    diameterMm: segment.diameterMm,
    pipeType: segment.pipeType,
    criticality: segment.criticality,
    previousBreaks: segment.previousBreaks
  }));

  return [...basePipes, ...generatedPipes];
}

function createNetworkSegments() {
  // The demo network follows short road-like segments instead of long direct
  // diagonals. It is still simulated, but should read as plausible GIS data.
  const waterTrunks = [
    [[10.389, 59.286], [10.397, 59.286], [10.405, 59.286], [10.414, 59.286], [10.424, 59.286]],
    [[10.391, 59.280], [10.400, 59.280], [10.409, 59.280], [10.418, 59.280], [10.428, 59.280]],
    [[10.392, 59.273], [10.401, 59.273], [10.410, 59.273], [10.419, 59.273], [10.429, 59.273]]
  ];
  const waterBranches = [
    [[10.397, 59.286], [10.397, 59.290], [10.397, 59.293], [10.404, 59.293]],
    [[10.405, 59.286], [10.405, 59.282], [10.405, 59.279], [10.400, 59.279]],
    [[10.414, 59.286], [10.414, 59.283], [10.423, 59.283], [10.429, 59.283]],
    [[10.409, 59.279], [10.409, 59.276], [10.410, 59.272]],
    [[10.401, 59.273], [10.401, 59.269], [10.397, 59.269], [10.397, 59.265], [10.394, 59.265]],
    [[10.419, 59.273], [10.419, 59.266], [10.421, 59.266], [10.421, 59.258]]
  ];
  const wastewater = [
    [[10.389, 59.286], [10.389, 59.281], [10.398, 59.281], [10.398, 59.275], [10.414, 59.275], [10.414, 59.265], [10.425, 59.265], [10.425, 59.258]],
    [[10.404, 59.293], [10.404, 59.286], [10.410, 59.286], [10.410, 59.279], [10.414, 59.279], [10.414, 59.275]],
    [[10.429, 59.283], [10.429, 59.276], [10.432, 59.276], [10.432, 59.270], [10.425, 59.270], [10.425, 59.258]],
    [[10.394, 59.265], [10.394, 59.261], [10.410, 59.261], [10.410, 59.258], [10.425, 59.258]],
    [[10.425, 59.258], [10.438, 59.258], [10.438, 59.263]]
  ];
  const stormwater = [
    [[10.386, 59.290], [10.394, 59.290], [10.394, 59.286], [10.405, 59.286], [10.405, 59.283], [10.424, 59.283]],
    [[10.392, 59.273], [10.398, 59.273], [10.398, 59.270], [10.414, 59.270], [10.414, 59.266], [10.432, 59.266]],
    [[10.394, 59.261], [10.402, 59.261], [10.402, 59.260], [10.421, 59.260], [10.431, 59.260]],
    [[10.429, 59.286], [10.435, 59.286], [10.435, 59.278], [10.441, 59.278], [10.441, 59.268]]
  ];

  return [
    ...createSegmentsFromRoutes(waterTrunks, {
      zoneId: ids.zoneNorth,
      material: "duktilt støpejern",
      installedYear: 1988,
      diameterMm: 200,
      pipeType: "water" as const,
      criticality: 68,
      previousBreaks: 1
    }),
    ...createSegmentsFromRoutes(waterBranches, {
      zoneId: ids.zoneSentrum,
      material: "PVC",
      installedYear: 2004,
      diameterMm: 160,
      pipeType: "water" as const,
      criticality: 52,
      previousBreaks: 0
    }),
    ...createSegmentsFromRoutes(wastewater, {
      zoneId: ids.catchmentB,
      material: "betong",
      installedYear: 1982,
      diameterMm: 250,
      pipeType: "wastewater" as const,
      criticality: 72,
      previousBreaks: 1
    }),
    ...createSegmentsFromRoutes(stormwater, {
      zoneId: ids.catchmentA,
      material: "PVC",
      installedYear: 2008,
      diameterMm: 315,
      pipeType: "stormwater" as const,
      criticality: 45,
      previousBreaks: 0
    })
  ];
}

function createSegmentsFromRoutes(
  routes: number[][][],
  defaults: {
    zoneId: string;
    material: string;
    installedYear: number;
    diameterMm: number;
    pipeType: "water" | "wastewater" | "stormwater";
    criticality: number;
    previousBreaks: number;
  }
) {
  return routes.flatMap((route) =>
    route.slice(0, -1).map((point, index) => ({
      ...defaults,
      coordinates: [point, route[index + 1]]
    }))
  );
}

async function seedNetworkNodes() {
  const nodes = [
    ["KUM-V-01", "kum", "water", "normal", [10.397, 59.286]],
    ["KUM-V-02", "kum", "water", "normal", [10.405, 59.286]],
    ["KUM-V-03", "kum", "water", "normal", [10.414, 59.286]],
    ["KUM-V-04", "kum", "water", "normal", [10.409, 59.280]],
    ["KUM-V-05", "kum", "water", "normal", [10.410, 59.273]],
    ["KUM-A-01", "kum", "wastewater", "normal", [10.398, 59.281]],
    ["KUM-A-02", "kum", "wastewater", "normal", [10.414, 59.275]],
    ["KUM-A-03", "kum", "wastewater", "normal", [10.425, 59.265]],
    ["KUM-A-04", "kum", "wastewater", "inspection", [10.425, 59.258]],
    ["KUM-O-01", "kum", "stormwater", "normal", [10.394, 59.286]],
    ["KUM-O-02", "kum", "stormwater", "normal", [10.414, 59.270]],
    ["KUM-O-03", "kum", "stormwater", "normal", [10.431, 59.260]],
    ["V-14", "valve", "water", "normal", [10.405, 59.282]],
    ["V-21", "valve", "water", "normal", [10.418, 59.280]],
    ["V-33", "valve", "water", "normal", [10.397, 59.290]],
    ["VM-NORD", "water_meter", "water", "normal", [10.389, 59.286]],
    ["VM-SENTRUM", "water_meter", "water", "normal", [10.392, 59.273]],
    ["TRYKK-01", "sensor", "water", "normal", [10.400, 59.279]],
    ["TRYKK-02", "sensor", "water", "warning", [10.421, 59.258]],
    ["NIVA-PS03", "sensor", "wastewater", "warning", [10.425, 59.258]]
  ] as const;

  for (const [nodeCode, nodeType, pipeType, status, [longitude, latitude]] of nodes) {
    await prisma.$executeRaw`
      INSERT INTO network_nodes (node_code, node_type, pipe_type, status, geometry)
      VALUES (${nodeCode}, ${nodeType}, ${pipeType}, ${status}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
    `;
  }
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
      '{"type":"Polygon","coordinates":[[[10.386,59.285],[10.398,59.285],[10.406,59.289],[10.405,59.298],[10.394,59.300],[10.386,59.296],[10.386,59.285]]]}'
    ],
    [
      "zones",
      ids.zoneSentrum,
      '{"type":"Polygon","coordinates":[[[10.404,59.271],[10.419,59.270],[10.430,59.274],[10.428,59.283],[10.415,59.286],[10.405,59.282],[10.404,59.271]]]}'
    ],
    [
      "zones",
      ids.zoneSouth,
      '{"type":"Polygon","coordinates":[[[10.389,59.252],[10.404,59.250],[10.416,59.255],[10.414,59.264],[10.399,59.266],[10.389,59.262],[10.389,59.252]]]}'
    ],
    [
      "zones",
      ids.catchmentA,
      '{"type":"Polygon","coordinates":[[[10.428,59.271],[10.443,59.271],[10.456,59.278],[10.453,59.287],[10.439,59.289],[10.430,59.283],[10.428,59.271]]]}'
    ],
    [
      "zones",
      ids.catchmentB,
      '{"type":"Polygon","coordinates":[[[10.414,59.249],[10.431,59.248],[10.441,59.255],[10.438,59.266],[10.424,59.269],[10.414,59.263],[10.414,59.249]]]}'
    ],
    [
      "zones",
      ids.catchmentC,
      '{"type":"Polygon","coordinates":[[[10.362,59.266],[10.376,59.265],[10.384,59.274],[10.380,59.285],[10.367,59.286],[10.360,59.279],[10.362,59.266]]]}'
    ]
  ] as const;

  for (const [table, id, geometry] of geometries) {
    await prisma.$executeRawUnsafe(
      `UPDATE ${table} SET geometry = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) WHERE id = $2::uuid`,
      geometry,
      id
    );
  }

  const waterZoneGeometryByZoneId = [
    ids.zoneNorth,
    ids.zoneSentrum,
    ids.zoneSouth
  ] as const;

  for (const zoneId of waterZoneGeometryByZoneId) {
    await prisma.$executeRaw`
      UPDATE water_zones wz
      SET geometry = z.geometry
      FROM zones z
      WHERE wz.zone_id = z.id AND z.id = ${zoneId}::uuid
    `;
  }

  const fixedPipeGeometries = [
    [ids.pipe141, '{"type":"LineString","coordinates":[[10.397,59.286],[10.397,59.290],[10.397,59.293],[10.404,59.293]]}'],
    [ids.pipe203, '{"type":"LineString","coordinates":[[10.409,59.280],[10.418,59.280],[10.428,59.280],[10.428,59.276]]}'],
    [ids.pipe312, '{"type":"LineString","coordinates":[[10.394,59.261],[10.402,59.261],[10.410,59.261],[10.418,59.258]]}']
  ] as const;

  for (const [id, geometry] of fixedPipeGeometries) {
    await prisma.$executeRaw`
      UPDATE pipes
      SET geometry = ST_SetSRID(ST_GeomFromGeoJSON(${geometry}), 4326)
      WHERE id = ${id}::uuid
    `;
  }

  for (const [index, segment] of createNetworkSegments().entries()) {
    const pipeCode = `Demo-${segment.pipeType}-${String(index + 1).padStart(2, "0")}`;
    const geometry = JSON.stringify({
      type: "LineString",
      coordinates: segment.coordinates
    });

    await prisma.$executeRaw`
      UPDATE pipes
      SET geometry = ST_SetSRID(ST_GeomFromGeoJSON(${geometry}), 4326)
      WHERE pipe_code = ${pipeCode}
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

  const incidentGeometries = [
    [ids.incidentLeakNorth, '{"type":"Point","coordinates":[10.397,59.292]}'],
    [ids.incidentComplaintNorth, '{"type":"Point","coordinates":[10.401,59.289]}'],
    [ids.incidentAlarmPs03, '{"type":"Point","coordinates":[10.425,59.258]}'],
    [ids.incidentOverflowPs03, '{"type":"Point","coordinates":[10.431,59.261]}']
  ] as const;

  for (const [id, geometry] of incidentGeometries) {
    await prisma.$executeRaw`
      UPDATE incidents
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
