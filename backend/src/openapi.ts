import "./openapi-environment";
import { writeFile } from "node:fs/promises";
import { ROUTES_OUTSIDE_API_PREFIX } from './app-setup';
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { buildOpenApiDocument } from "./main";

async function exportOpenApi(): Promise<void> {
  process.env.SKIP_DATABASE_CONNECT = "true";
  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
    logger: ["error"],
  });
  app.setGlobalPrefix("api", {
    exclude: ROUTES_OUTSIDE_API_PREFIX,
  });
  const document = buildOpenApiDocument(app);
  await writeFile("openapi.json", JSON.stringify(document, null, 2), "utf8");
  await app.close();
}

void exportOpenApi().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
