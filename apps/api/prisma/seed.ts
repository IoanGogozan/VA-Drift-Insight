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
        id: "catchment-b",
        name: "Avløpssone B",
        zoneType: "wastewater_catchment",
        population: 3800,
        dataQualityScore: 75
      }
    ]
  });

  await prisma.pumpStation.create({
    data: {
      id: "ps-03",
      stationCode: "PS-03",
      name: "PS-03 Skoglia",
      catchmentId: "catchment-b",
      capacityM3h: 180,
      alarmCount: 7,
      overflowEvents: 2
    }
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
