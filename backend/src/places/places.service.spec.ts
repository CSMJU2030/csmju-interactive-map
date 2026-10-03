import { PlaceCategory, Prisma } from "@prisma/client";
import type { PrismaService } from "../prisma/prisma.service";
import type { PlaceReferenceService } from './place-reference.service';
import { PlacesService } from "./places.service";

const samplePlace = {
  id: "b1d637b2-2946-4df0-b593-cd8d6d046a8a",
  roomCode: "LAB-03",
  landmarkLabel: null,
  description: null,
  category: PlaceCategory.COMPUTER_LAB,
  positionX: new Prisma.Decimal(20),
  positionY: new Prisma.Decimal(10),
  width: new Prisma.Decimal(12),
  height: new Prisma.Decimal(8),
  isActive: true,
  createdAt: new Date("2026-08-15T10:00:00.000Z"),
  updatedAt: new Date("2026-08-15T10:00:00.000Z"),
  lecturers: [],
  keywords: [
    {
      id: "keyword-id",
      keyword: "lab",
      placeId: "b1d637b2-2946-4df0-b593-cd8d6d046a8a",
    },
  ],
};

describe("PlacesService", () => {
  const findMany = jest.fn().mockResolvedValue([samplePlace]);
  const count = jest.fn().mockResolvedValue(21);
  const update = jest.fn().mockResolvedValue(samplePlace);
  const mapLayoutRow = {
    id: "main",
    corridorPoints: [
      { x: 25, y: 7 },
      { x: 25, y: 44 },
    ],
    corridorWidth: new Prisma.Decimal(4.2),
    updatedAt: new Date("2026-08-22T00:00:00.000Z"),
  };
  const findUniqueLayout = jest.fn().mockResolvedValue(mapLayoutRow);
  const upsertLayout = jest.fn().mockResolvedValue(mapLayoutRow);
  const transactionClient = {
    place: { update },
    mapLayout: { findUnique: findUniqueLayout, upsert: upsertLayout },
  };
  const prisma = {
    place: { findMany, count, update },
    mapLayout: { findUnique: findUniqueLayout, upsert: upsertLayout },
    $transaction: jest.fn(
      (
        operation:
          | Array<Promise<unknown>>
          | ((client: typeof transactionClient) => Promise<unknown>),
      ) =>
        typeof operation === "function"
          ? operation(transactionClient)
          : Promise.all(operation),
    ),
  } as unknown as PrismaService;
  const service = new PlacesService(prisma, {room: jest.fn().mockResolvedValue({nameTh:'ห้องปฏิบัติการ 3'}), rooms:jest.fn().mockResolvedValue([]), validate:jest.fn()} as unknown as PlaceReferenceService);

  beforeEach(() => jest.clearAllMocks());

  it("applies skip/take pagination and maps decimals to JSON numbers", async () => {
    const result = await service.findAll({
      page: 2,
      limit: 10,
    }, 'verified-token');
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
    expect(result.total).toBe(21);
    expect(result.data[0].positionX).toBe(20);
  });

  it("uses partial case-insensitive search across place and lecturer data", async () => {
    await service.search({ q: "  lab  ", page: 1, limit: 20 }, 'verified-token');
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          OR: expect.arrayContaining([
            { roomCode: { contains: "lab", mode: "insensitive" } },
            { landmarkLabel: { contains: "lab", mode: "insensitive" } },
          ]),
        }),
      }),
    );
  });

  it("updates multiple room layouts in one transaction", async () => {
    count.mockResolvedValueOnce(2);
    const items = [
      {
        id: "b1d637b2-2946-4df0-b593-cd8d6d046a8a",
        positionX: 12,
        positionY: 14,
        width: 16,
        height: 10,
      },
      {
        id: "44bd380e-27c9-40e0-8140-708ddc57c9ba",
        positionX: 32,
        positionY: 24,
        width: 14,
        height: 12,
      },
    ];

    const result = await service.updateLayout({ items }, 'verified-token');

    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: items[0].id },
        data: {
          positionX: 12,
          positionY: 14,
          width: 16,
          height: 10,
        },
      }),
    );
    expect(result.places).toHaveLength(2);
    expect(result.mapLayout.corridorWidth).toBe(4.2);
  });

  it("updates an editable corridor without requiring room changes", async () => {
    await service.updateLayout({
      corridor: {
        corridorPoints: [
          { x: 20, y: 5 },
          { x: 20, y: 45 },
          { x: 85, y: 45 },
        ],
        corridorWidth: 5,
      },
    }, 'verified-token');

    expect(upsertLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "main" },
        update: {
          corridorPoints: [
            { x: 20, y: 5 },
            { x: 20, y: 45 },
            { x: 85, y: 45 },
          ],
          corridorWidth: 5,
        },
      }),
    );
  });
});
