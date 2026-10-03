import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule, getSchemaPath } from "@nestjs/swagger";
import { CurrentUserDto, MapPointDto, ApiErrorEnvelopeDto } from './contracts/map-contract.dto';
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { configureApp, ROUTES_OUTSIDE_API_PREFIX } from './app-setup';

export const buildOpenApiDocument = (
  app: Awaited<ReturnType<typeof NestFactory.create>>,
) => {
  const config = new DocumentBuilder()
    .setTitle("CSMJU Interactive Map API")
    .setDescription("REST API for the CSMJU2030 Interactive Map subsystem")
    .setVersion("1.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "core-hub-bearer",
    )
    .addCookieAuth("csmju_interactive_map_access_token")
    .build();
  const document = SwaggerModule.createDocument(app, config, {extraModels:[CurrentUserDto, MapPointDto, ApiErrorEnvelopeDto]});
  const me = document.paths['/api/v1/me']?.get;
  if (me) {
    me.security = [{'core-hub-bearer':[]}];
    me.responses = {'200': {description:'Verified Core Hub identity',content:{'application/json':{schema:{type:'object',required:['success','data'],properties:{success:{type:'boolean',enum:[true]},data:{$ref:getSchemaPath(CurrentUserDto)}}}}}}};
  }
  for (const [path, method, status] of [['/auth/login','get','302'],['/auth/callback','get','302'],['/auth/logout','post','303']] as const) {
    const operation = document.paths[path]?.[method];
    if (operation) operation.responses = {[status]:{description:'Core Hub SSO redirect'}};
  }
  return document;
};

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.use(
    (
      _request: unknown,
      response: {
        removeHeader(name: string): void;
        setHeader(name: string, value: string): void;
      },
      next: () => void,
    ) => {
      response.removeHeader("X-Powered-By");
      response.setHeader("X-Content-Type-Options", "nosniff");
      response.setHeader("X-Frame-Options", "DENY");
      response.setHeader("Referrer-Policy", "no-referrer");
      next();
    },
  );
  app.enableCors({
    origin: config
      .get<string>("CORS_ORIGIN", "http://localhost:3202")
      .split(","),
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  });
  configureApp(app);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.setGlobalPrefix("api", {
    exclude: ROUTES_OUTSIDE_API_PREFIX,
  });

  const document = buildOpenApiDocument(app);
  SwaggerModule.setup("docs", app, document, {
    jsonDocumentUrl: "openapi.json",
  });

  const port = config.get<number>("PORT", 4202);
  await app.listen(port, "0.0.0.0");

  new Logger("Bootstrap").log(
    JSON.stringify({
      event: "subsystem.started",
      subsystem: config.get<string>("SUBSYSTEM_ID", "csmju-interactive-map"),
      port,
      coreHubUrl: config.get<string>("CORE_HUB_URL"),
      jwksUrl: config.get<string>("CORE_HUB_JWKS_URL"),
      issuer: config.get<string>("CORE_HUB_ISSUER", "core-hub"),
      audience: config.get<string>("CORE_HUB_AUDIENCE", "csmju2030"),
    }),
  );
}

if (require.main === module) {
  void bootstrap();
}
