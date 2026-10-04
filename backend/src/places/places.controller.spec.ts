import type { PlacesService } from "./places.service";
import { PlacesController } from "./places.controller";

describe("PlacesController", () => {
  const service = {
    findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    search: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  } as unknown as PlacesService;
  const controller = new PlacesController(service);

  it("GET places returns a paginated envelope, never a raw array", async () => {
    const response = await controller.findAll({ page: 1, limit: 20 }, 'verified-token');
    expect(response).toEqual({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  });

  it("search returns pagination metadata", async () => {
    const response = await controller.search({
      q: "lab",
      page: 2,
      limit: 5,
    }, 'verified-token');
    expect(response.meta?.page).toBe(2);
    expect(response.meta?.limit).toBe(5);
  });
});
