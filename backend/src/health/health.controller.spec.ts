import { HealthController } from "./health.controller";

describe("HealthController", () => {
  it("returns a healthy standard envelope", () => {
    const response = new HealthController().check();
    expect(response.status).toBe("ok");
    expect(new Date(response.timestamp).toISOString()).toBe(
      response.timestamp,
    );
  });
});
