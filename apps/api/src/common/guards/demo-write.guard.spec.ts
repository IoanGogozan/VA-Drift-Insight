import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DemoWriteGuard } from "./demo-write.guard";

describe("DemoWriteGuard", () => {
  function createContext(providedKey?: string) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          header: (name: string) => (name === "x-demo-api-key" ? providedKey : undefined)
        })
      })
    };
  }

  it("allows requests with the expected demo API key", () => {
    const guard = new DemoWriteGuard({
      get: jest.fn().mockReturnValue("test-key")
    } as unknown as ConfigService);

    expect(guard.canActivate(createContext("test-key") as never)).toBe(true);
  });

  it("rejects requests without the expected demo API key", () => {
    const guard = new DemoWriteGuard({
      get: jest.fn().mockReturnValue("test-key")
    } as unknown as ConfigService);

    expect(() => guard.canActivate(createContext("wrong-key") as never)).toThrow(UnauthorizedException);
  });
});
