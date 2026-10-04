import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest, fieldError } from "./api";
import { renewSignIn } from "./sign-in";

vi.mock("./sign-in", () => ({ renewSignIn: vi.fn() }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function respond(status: number, body: unknown, requestId = "request-42") {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(body), {
          status,
          headers: { "x-request-id": requestId },
        }),
      ),
  );
}

describe("API failure feedback", () => {
  it("preserves validation field and request reference", async () => {
    respond(400, {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "กรุณากรอกชื่อสถานที่",
        details: { field: "nameTh" },
      },
    });
    const failure = await apiRequest("/api/v1/places").catch(
      (error: unknown) => error,
    );
    expect(failure).toBeInstanceOf(ApiError);
    expect(fieldError(failure)).toEqual({
      field: "nameTh",
      message: "กรุณากรอกชื่อสถานที่",
    });
    expect(failure).toMatchObject({ status: 400, requestId: "request-42" });
  });
  it("never exposes internal English server messages", async () => {
    respond(500, {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "SQL connection details secret",
      },
    });
    await expect(apiRequest("/api/v1/places")).rejects.toMatchObject({
      message: "ระบบขัดข้องชั่วคราว กรุณาลองอีกครั้ง",
    });
  });
  it("retains the request reference for non-JSON failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("Bad gateway", {
            status: 502,
            headers: { "x-request-id": "gateway-42" },
          }),
        ),
    );
    await expect(apiRequest("/api/v1/places")).rejects.toMatchObject({
      requestId: "gateway-42",
      status: 502,
      details: undefined,
    });
  });
  it("renews expired sessions for protected requests", async () => {
    respond(401, { success: false, error: { code: "UNAUTHORIZED" } });
    await expect(apiRequest("/api/v1/places")).rejects.toMatchObject({
      status: 401,
    });
    expect(renewSignIn).toHaveBeenCalledOnce();
  });
  it("allows anonymous session discovery without a renewal loop", async () => {
    respond(401, { success: false, error: { code: "UNAUTHORIZED" } });
    await expect(apiRequest("/api/v1/me")).rejects.toMatchObject({
      status: 401,
    });
    expect(renewSignIn).not.toHaveBeenCalled();
  });
  it("offers Thai network feedback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(apiRequest("/api/v1/places")).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      status: 0,
      message:
        "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง",
    });
  });
});
