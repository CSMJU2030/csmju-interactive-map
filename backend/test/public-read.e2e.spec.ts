import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { bootApp } from "./helpers/boot-app";
import { InMemoryPrisma } from "./helpers/in-memory-prisma";

describe("Public visitors with the production authentication guards", () => {
  let app: INestApplication;
  beforeAll(async () => {
    const db = {
      place: {
        findMany: async () => [],
        count: async () => 0,
        findFirst: async () => null,
      },
      lecturer: { findMany: async () => [], count: async () => 0 },
      mapLayout: { findUnique: async () => null },
      $transaction: (queries: Promise<unknown>[]) => Promise.all(queries),
    };
    app = await bootApp(db as unknown as InMemoryPrisma);
  });
  afterAll(async () => app.close());
  it.each([
    "/api/v1/places",
    "/api/v1/places/search?q=LAB",
    "/api/v1/places/layout-config",
    "/api/v1/lecturers/directory",
  ])("allows visitors to read %s without a cookie or token", async (path) => {
    const response = await request(app.getHttpServer()).get(path).expect(200);
    expect(response.body.success).toBe(true);
  });
  it("does not require a fresh session to view public data", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/lecturers/directory")
      .set("Authorization", "Bearer expired-token")
      .expect(200);
    await request(app.getHttpServer())
      .get("/api/v1/places/99999999-9999-4999-8999-999999999999")
      .expect(404);
  });
  it.each([
    "/api/v1/me",
    "/api/v1/places/admin-list",
    "/api/v1/places/stats",
    "/api/v1/places/registrar-timetable",
    "/api/v1/lecturers",
    "/api/v1/lecturers/search?q=test",
  ])("continues to require authentication for %s", async (path) => {
    await request(app.getHttpServer()).get(path).expect(401);
  });
  it("keeps mutations and personnel import protected", async () => {
    for (const path of [
      "/api/v1/places",
      "/api/v1/lecturers",
      "/api/v1/lecturers/import-csmju",
    ]) {
      await request(app.getHttpServer()).post(path).send({}).expect(401);
    }
    for (const path of [
      "/api/v1/places/99999999-9999-4999-8999-999999999999",
      "/api/v1/lecturers/99999999-9999-4999-8999-999999999999",
      "/api/v1/places/layout",
    ]) {
      await request(app.getHttpServer()).patch(path).send({}).expect(401);
      if (!path.endsWith("/layout"))
        await request(app.getHttpServer()).delete(path).expect(401);
    }
  });
});
