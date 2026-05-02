import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type HeaderReadableRequest = {
  header(name: string): string | undefined;
};

@Injectable()
export class DemoWriteGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<HeaderReadableRequest>();
    const expectedKey = this.config.get<string>("DEMO_API_KEY") ?? "local-demo-key";
    const providedKey = request.header("x-demo-api-key");

    if (providedKey !== expectedKey) {
      throw new UnauthorizedException("Demo write access is required.");
    }

    return true;
  }
}
