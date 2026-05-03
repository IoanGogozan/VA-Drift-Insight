import { ImportsService } from "./imports.service";

describe("ImportsService", () => {
  it("stores a demo dataset import run with validation warnings", async () => {
    const prisma = {
      zone: {
        count: jest.fn().mockResolvedValue(2),
        findMany: jest.fn().mockResolvedValue([])
      },
      waterZone: {
        count: jest.fn().mockResolvedValue(2)
      },
      privateServiceCase: {
        count: jest.fn().mockResolvedValue(3)
      },
      fieldTask: {
        count: jest.fn().mockResolvedValue(4)
      },
      pipe: {
        count: jest.fn().mockResolvedValue(3),
        findMany: jest.fn().mockResolvedValue([{ id: "pipe-1", pipeCode: "P-1" }])
      },
      pumpStation: { count: jest.fn().mockResolvedValue(1) },
      incident: { count: jest.fn().mockResolvedValue(1) },
      timeSeries: { count: jest.fn().mockResolvedValue(0) },
      weatherObservation: { count: jest.fn().mockResolvedValue(5) },
      $queryRaw: jest
        .fn()
        .mockResolvedValueOnce([{ count: BigInt(4) }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]),
      importRun: {
        create: jest.fn().mockImplementation(({ data }) => ({
          id: "run-1",
          ...data,
          createdAt: new Date("2026-05-03T10:00:00.000Z"),
          validationErrors: data.validationErrors.create
        }))
      }
    };
    const service = new ImportsService(prisma as never);

    const result = await service.runDemoDatasetImport();

    expect(prisma.importRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          importType: "demo_dataset",
          status: "completed_with_warnings",
          totalRows: 25,
          rejectedRows: 0,
          warningCount: 2
        })
      })
    );
    expect(result.validationErrors).toHaveLength(2);
    expect(JSON.stringify(result.validationErrors)).toContain("Ingen tidsseriedata");
  });
});
