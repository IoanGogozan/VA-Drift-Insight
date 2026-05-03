import { ReportsService } from "./reports.service";

describe("ReportsService", () => {
  it("builds a monthly report from leakage, private cases and field tasks", async () => {
    const prisma = {
      incident: {
        count: jest.fn().mockResolvedValue(4)
      },
      privateServiceCase: {
        findMany: jest.fn().mockResolvedValue([{ estimatedLossM3Day: 6.4 }]),
        count: jest.fn().mockResolvedValue(2)
      },
      fieldTask: {
        count: jest.fn().mockResolvedValueOnce(3).mockResolvedValueOnce(1),
        findMany: jest.fn().mockResolvedValue([{ zone: { name: "Målesone Nord" } }])
      },
      waterZone: {
        findMany: jest.fn().mockResolvedValue([{ name: "Målesone Nord", estimatedLossM3Day: 98.4 }])
      }
    };
    const service = new ReportsService(prisma as never, {} as never, { get: jest.fn() } as never);

    await expect(service.getMonthlyReport()).resolves.toMatchObject({
      leaksFound: 4,
      estimatedSavedM3: 192,
      municipal: 3,
      private: 1,
      openCases: 5,
      completedFieldTasks: 1,
      estimatedOpenLossM3Day: 98.4,
      recommendedZones: ["Målesone Nord"]
    });
  });
});
