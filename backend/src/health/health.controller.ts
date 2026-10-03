import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { success } from "../common/types/api-response";
import { Public } from "../auth/decorators/public.decorator";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: "Service health check" })
  check(): {
    status: string;
    service: string;
    timestamp: string;
  } {
    return success({
      status: "ok",
      service: "csmju-interactive-map",
      timestamp: new Date().toISOString(),
    });
  }
}
