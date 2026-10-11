import { PlaceReferenceService } from "./place-reference.service";
describe("Local rooms", () => {
  const service = new PlaceReferenceService();
  it("allows editing a room code and name together", () => {
    expect(service.validate("LECT-NEW", "ชื่อห้องใหม่")).toBeUndefined();
  });
  it("allows named landmarks without a room code", () => {
    expect(service.validate(null, "ทางเดิน")).toBeUndefined();
  });
  it("rejects a location with no name or code", () => {
    expect(() => service.validate(" ", " ")).toThrow();
  });
});
