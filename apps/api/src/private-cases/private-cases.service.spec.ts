import { PrivateCasesService } from "./private-cases.service";

describe("PrivateCasesService", () => {
  it("returns private service cases with Norwegian status labels", async () => {
    const prisma = {
      privateServiceCase: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "40000000-0000-4000-8000-000000000001",
            address: "Kjelleveien 18",
            status: "suspected",
            estimatedLossM3Day: 18.5,
            lastFollowUp: new Date("2026-04-24T09:00:00.000Z"),
            nextFollowUp: new Date("2026-05-06T09:00:00.000Z"),
            createdAt: new Date("2026-04-20T09:00:00.000Z"),
            updatedAt: new Date("2026-04-24T09:00:00.000Z"),
            zone: {
              id: "11111111-1111-4111-8111-111111111111",
              name: "Målesone Nord"
            }
          }
        ])
      }
    };
    const service = new PrivateCasesService(prisma as never);

    await expect(service.getPrivateCases({})).resolves.toMatchObject([
      {
        address: "Kjelleveien 18",
        zoneName: "Målesone Nord",
        status: "suspected",
        statusLabel: "Mistenkt",
        estimatedLossM3Day: 18.5
      }
    ]);
  });

  it("updates status and last follow-up when status changes", async () => {
    const prisma = {
      privateServiceCase: {
        findUnique: jest.fn().mockResolvedValue({ id: "case-1", status: "suspected" }),
        update: jest.fn().mockResolvedValue({
          id: "case-1",
          address: "Kjelleveien 18",
          status: "contacted",
          estimatedLossM3Day: 18.5,
          lastFollowUp: new Date("2026-05-03T12:00:00.000Z"),
          nextFollowUp: new Date("2026-05-08T10:00:00.000Z"),
          createdAt: new Date("2026-04-20T09:00:00.000Z"),
          updatedAt: new Date("2026-05-03T12:00:00.000Z"),
          zone: { id: "zone-1", name: "Målesone Nord" }
        })
      }
    };
    const service = new PrivateCasesService(prisma as never);

    await expect(service.updatePrivateCase("case-1", { status: "contacted" })).resolves.toMatchObject({
      id: "case-1",
      status: "contacted",
      statusLabel: "Kontaktet"
    });
    expect(prisma.privateServiceCase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "contacted",
          lastFollowUp: expect.any(Date)
        })
      })
    );
  });
});
