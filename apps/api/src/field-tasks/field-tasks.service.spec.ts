import { FieldTasksService } from "./field-tasks.service";

describe("FieldTasksService", () => {
  it("returns field tasks with method and status labels", async () => {
    const prisma = {
      fieldTask: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "50000000-0000-4000-8000-000000000001",
            type: "leakage_control",
            priority: "high",
            reason: "Økt nattforbruk",
            suggestedMethod: "listening",
            status: "new",
            lastChecked: null,
            createdAt: new Date("2026-05-03T10:00:00.000Z"),
            updatedAt: new Date("2026-05-03T10:00:00.000Z"),
            zone: { id: "zone-1", name: "Målesone Nord" }
          }
        ])
      }
    };
    const service = new FieldTasksService(prisma as never);

    await expect(service.getFieldTasks({})).resolves.toMatchObject([
      {
        areaName: "Målesone Nord",
        priorityLabel: "Høy",
        suggestedMethodLabel: "Lytting",
        statusLabel: "Ny"
      }
    ]);
  });

  it("sets lastChecked automatically when completing a task", async () => {
    const prisma = {
      fieldTask: {
        findUnique: jest.fn().mockResolvedValue({ id: "task-1", status: "planned" }),
        update: jest.fn().mockResolvedValue({
          id: "task-1",
          type: "leakage_control",
          priority: "high",
          reason: "Økt nattforbruk",
          suggestedMethod: "listening",
          status: "completed",
          lastChecked: new Date("2026-05-03T10:00:00.000Z"),
          createdAt: new Date("2026-05-03T10:00:00.000Z"),
          updatedAt: new Date("2026-05-03T10:00:00.000Z"),
          zone: { id: "zone-1", name: "Målesone Nord" }
        })
      }
    };
    const service = new FieldTasksService(prisma as never);

    await expect(service.updateFieldTask("task-1", { status: "completed" })).resolves.toMatchObject({
      id: "task-1",
      status: "completed",
      statusLabel: "Utført"
    });
    expect(prisma.fieldTask.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "completed",
          lastChecked: expect.any(Date)
        })
      })
    );
  });
});
